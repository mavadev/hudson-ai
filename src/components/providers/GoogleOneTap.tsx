"use client";

import { useEffect } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

export const GoogleOneTap = () => {
  const { openGoogleOneTap } = useClerk();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      openGoogleOneTap();
    }
  }, [isLoaded, user, openGoogleOneTap]);

  return null;
};
