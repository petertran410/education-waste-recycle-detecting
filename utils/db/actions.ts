import { db } from "./dbConfig";
import { Notifications, Transactions, Users, Reports, Rewards } from "./schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const createUser = async (email: string, name: string) => {
  try {
    const [user] = await db
      .insert(Users)
      .values({ email, name })
      .returning()
      .execute();
    return user;
  } catch (error) {
    console.log("Error creating user", error);
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email));
    return user;
  } catch (error) {
    console.log("Error fetching user by email", error);
    return null;
  }
};

export const getUnreadNotification = async (userId: number) => {
  try {
    return await db
      .select()
      .from(Notifications)
      .where(
        and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))
      )
      .execute();
  } catch (error) {
    console.log("Error fetching unread notification", error);
    return null;
  }
};

export const getUserBalance = async (userId: number): Promise<number> => {
  const transactions = (await getRewardTransactions(userId)) || [];

  if (!transactions) {
    return 0;
  }

  const balance = transactions.reduce((acc: number, transaction: any) => {
    return transaction.type.startsWith("earned")
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);
  return Math.max(balance, 0);
};

export const getRewardTransactions = async (userId: number) => {
  try {
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      date: t.date.toISOString().split("T")[0], // YYYY-MM-DD
    }));

    return formattedTransactions;
  } catch (error) {
    console.log("Error fetching reward transactions", error);
    return null;
  }
};

export const markNotificationAsRead = async (notificationId: number) => {
  try {
    await db
      .update(Notifications)
      .set({ isRead: true })
      .where(eq(Notifications.id, notificationId))
      .execute();
  } catch (error) {
    console.log("Error marking notification as read", error);
  }
};

export const updateRewardPoints = async (
  userId: number,
  pointsToAdd: number
) => {
  try {
    const [updateReward] = await db
      .update(Rewards)
      .set({
        points: sql`${Rewards.points} + ${pointsToAdd}`,
      })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();
    return updateReward;
  } catch (error) {
    console.log("Error updating reward points", error);
  }
};

export const createTransaction = async (
  userId: number,
  type: "earned_report" | "earned_collect" | "redeemed",
  amount: number,
  description: string
) => {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({
        userId,
        type,
        amount,
        description,
      })
      .returning()
      .execute();

    return transaction;
  } catch (error) {
    console.log("Error creating transaction", error);
    throw error;
  }
};

export const createNotification = async (
  userId: number,
  message: string,
  type: string
) => {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({
        userId,
        message,
        type,
      })
      .returning()
      .execute();

    return notification;
  } catch (error) {
    console.log("Error creating notification", error);
    throw error;
  }
};

export const createReport = async (
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  verificationResult?: any
) => {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    const pointsEarned = 10;

    // update rewards points
    await updateRewardPoints(userId, pointsEarned);
    // create transaction
    await createTransaction(
      userId,
      "earned_report",
      pointsEarned,
      "Points earned for reporting waste "
    );
    // create notification
    await createNotification(
      userId,
      `You have earned ${pointsEarned} points for reporting waste!`,
      "reward"
    );

    return report;
  } catch (error) {
    console.log("Error creating report", error);
    throw error;
  }
};

export const getRecentReports = async (limit: number = 10) => {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.timeCreate))
      .limit(limit)
      .execute();

    return reports;
  } catch (error) {
    console.log("Error fecting recent reports", error);
    return [];
  }
};
