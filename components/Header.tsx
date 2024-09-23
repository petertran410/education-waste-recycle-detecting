"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  Menu,
  Coins,
  Leaf,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Badge } from "./ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  createUser,
  getUnreadNotification,
  getUserBalance,
  getUserByEmail,
  markNotificationAsRead,
} from "@/utils/db/actions";

const clientId = process.env.WEB3AUTH_API_KEY;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://assets.web3auth.io/evm-chains/sepolia.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3Auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathName = usePathname();
  const [notification, setNotification] = useState<Notification[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        await web3Auth.initModal();
        setProvider(web3Auth.provider);

        // check the log in
        if (web3Auth.connected) {
          setLoggedIn(true);

          const user = await web3Auth.getUserInfo();
          setUserInfo(user);

          if (user.email) {
            localStorage.setItem("userEmail", user.email);

            try {
              await createUser(user.email, user.name || "Anonymous user");
            } catch (error) {
              console.log("Error creating error", error);
            }
          }
        }
      } catch (error) {
        console.log("Error initializing web3auth", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchNotification = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);

        if (user) {
          const unreadNotifications = await getUnreadNotification(user.id);
          setNotification(unreadNotifications);
        }
        fetchNotification();

        const notificationInterval = setInterval(fetchNotification, 30000);
        return () => clearInterval(notificationInterval);
      }
    };
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = getUserBalance(user.id);
          setBalance(await userBalance);
        }
      }

      fetchUserBalance();

      const handleBalanceUpdate = (event: CustomEvent) => {
        setBalance(event.detail);
      };

      window.addEventListener(
        "Balance Update",
        handleBalanceUpdate as EventListener
      );

      return () => {
        window.removeEventListener(
          "Balance Update",
          handleBalanceUpdate as EventListener
        );
      };
    };
  }, [userInfo]);

  const login = async () => {
    if (!web3Auth) {
      console.log("Web3Auth is not initialized");
      return;
    }
    try {
      const web3authProvider = await web3Auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3Auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.log("Error creating email", error);
        }
      }
    } catch (error) {
      console.log("Error logging in", error);
    }
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("Web3Auth is not initialized");
      return;
    }

    try {
      await web3Auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
    } catch (error) {
      console.log("Error logging out", error);
    }
  };

  const getUserInfo = async () => {
    if (web3Auth.connected) {
      const user = await web3Auth.getUserInfo();
      setUserInfo(user);

      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        try {
          await createUser(user.email, user.name || "Anonymous User");
        } catch (error) {
          console.log("Error creating user", error);
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
  };

  if (loading) {
    return <div>Loading web3 auth ...</div>;
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4"
            onClick={onMenuClick}>
            <Menu className="h-6 w-6 text-gray-800" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <span className="font-bold txt-base md:text-lg text-gray-800">
              Recycle Waste
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
