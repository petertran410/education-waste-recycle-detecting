"use client";

import { useState, useEffect, HTMLAttributes } from "react";
import {
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  Upload,
  Loader,
  Calendar,
  Weight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getUserByEmail,
  getWasteCollectionTask,
  updateTaskStatus,
} from "@/utils/db/actions";

const geminiApiKey = process.env.GEMINI_API_KEY;

type CollectionTask = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "pending" | "in_progress" | "completed" | "verified";
  date: string;
  collectorId: number | null;
};

const ITEMS_PER_PAGE = 5;

export default function CollectPage() {
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverWasteType, setHoverWasteType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserAndTask = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");

        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail);
          if (fetchedUser) {
            setUser(fetchedUser);
          } else {
            toast.error("User not logged in. Please log in");
          }
        }

        const fetchedTasks = await getWasteCollectionTask();
        setTasks(fetchedTasks);
      } catch (error) {
        console.log("Error fetching user and tasks", error);
        toast.error("Failed to load user data and tasks. Please try again");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndTask();
  }, []);

  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(
    null
  );
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [verificationResult, setVerificationResult] = useState<{
    wasteTypeMatch: boolean;
    quantityMatch: boolean;
    confidence: number;
  } | null>(null);
  const [reward, setReward] = useState<number | null>(null);

  const handleStatusChange = async (
    taskId: number,
    newStatus: CollectionTask["status"]
  ) => {
    if (!user) {
      toast.error("Please login to collect waste");
      return;
    }

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus, user.id);
      if (updatedTask) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: newStatus, collectorId: user.id }
              : task
          )
        );
        toast.success("Task status updated successfully");
      } else {
        toast.error("Failed to update task status. Please try again");
      }
    } catch (error) {
      console.log("Error updating task status", error);
      toast.error("Failed to update task status. Please try again");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setVerificationImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
}
