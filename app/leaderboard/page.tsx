"use client";

import { useState, useEffect } from "react";
import { Loader, Award, User, Trophy, Crown } from "lucide-react";
import { toast } from "react-hot-toast";

type Reward = {
  id: number;
  userId: number;
  points: number;
  level: number;
  timeCreate: Date;
  userName: string | null;
};

export function LeaderboardPage() {
  
}