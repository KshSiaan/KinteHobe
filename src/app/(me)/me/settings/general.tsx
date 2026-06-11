"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import React from "react";

export default function General() {
  const user = authClient.useSession().data?.user;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          General Settings
        </CardTitle>
        <CardDescription>
          Manage your general account settings, including profile information
          and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Avatar className="size-24">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback>
            {user?.name ? user.name.charAt(0) : "U"}
          </AvatarFallback>
        </Avatar>

        <div className="mt-6">
          <form
            onSubmit={(e) => {
              console.log(e.bubbles);
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input placeholder="Enter your full name" />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input placeholder="Email cant be changed" />
              </Field>
              <div className="">
                <Button>Save Changes</Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
