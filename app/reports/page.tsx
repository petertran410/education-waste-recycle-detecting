"use client";

import { useState, useCallback, useEffect } from "react";
import { MapPin, Upload, CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  StandaloneSearchBox,
  useJsApiLoader,
  Libraries,
} from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const geminiApiKey = process.env.GEMINI_API_KEY;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY as any;

const libraries: Libraries = ["places"];

export default function ReportPage() {
  const [user, setUser] = useState("");
  const router = useRouter();

  const [report, setReport] = useState<
    Array<{
      id: number;
      location: string;
      wasteType: string;
      amount: string;
      timeCreate: string;
    }>
  >([]);

  const [newReports, setNewReports] = useState({
    location: "",
    type: "",
    amount: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string;
    quantity: number;
    confidence: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);

  const [isLoaded] = useState({
    id: "google-map-script",
    googleMapsApiKey: googleMapsApiKey,
    libraries: libraries,
  });

  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlaceChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        setNewReports((prev) => ({
          ...prev,
          location: place.formatted_address || "",
        }));
      }
    }
  };
}
