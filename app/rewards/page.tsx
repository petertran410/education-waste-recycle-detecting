"use client";

import { useState, useEffect } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import React from "react";

type Transaction = {
  id: number;
  type: "earned_report" | "earned_collect" | "redeemed";
  amount: number;
  description: string;
  date: number;
};

type Reward = {
  id: number;
  name: string;
  cost: number;
  description: string | null;
  collectionInfo: string;
};

export default function RewardsPage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  return <>In Develope</>;
}
