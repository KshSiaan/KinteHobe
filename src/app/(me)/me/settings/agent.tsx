import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

export default function Agent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent Configuration</CardTitle>
        <CardDescription>
          Configure your agent settings and preferences here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label>Language</Label>
        <Input />
        <Label>Response Type</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select response type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concise">Concise</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
          </SelectContent>
        </Select>
        <Label>Show Product Image</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="show">Show</SelectItem>
            <SelectItem value="dont_show">Dont Show</SelectItem>
          </SelectContent>
        </Select>
        <Label>Include Product Links</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes Please</SelectItem>
            <SelectItem value="dont">No Need</SelectItem>
          </SelectContent>
        </Select>
        <Label>Confirm Before Action</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes Please</SelectItem>
            <SelectItem value="dont">No Need</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
