"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  getStoredAgentConfig,
  STORAGE_KEY,
  type AgentConfig,
} from "@/lib/ai/agent-config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

export { STORAGE_KEY } from "@/lib/ai/agent-config";

export default function Agent() {
  const [config, setConfig] = useState<AgentConfig>(() => {
    return getStoredAgentConfig();
  });

  // Update localStorage whenever the config state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Generic handler to update specific fields
  const handleChange = (key: keyof AgentConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent Configuration</CardTitle>
        <CardDescription>
          Configure your agent settings and preferences here. Changes are saved
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language */}
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={config.language}
            onValueChange={(val) => handleChange("language", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="bangla">Bangla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Response Type */}
        <div className="space-y-2">
          <Label>Response Type</Label>
          <Select
            value={config.responseType}
            onValueChange={(val) => handleChange("responseType", val)}
          >
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
        </div>

        {/* Show Product Image */}
        <div className="space-y-2">
          <Label>Show Product Image</Label>
          <Select
            value={config.showProductImage}
            onValueChange={(val) => handleChange("showProductImage", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="show">Show</SelectItem>
              <SelectItem value="dont_show">Dont Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Product Links */}
        <div className="space-y-2">
          <Label>Include Product Links</Label>
          <Select
            value={config.includeProductLinks}
            onValueChange={(val) => handleChange("includeProductLinks", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes Please</SelectItem>
              <SelectItem value="dont">No Need</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confirm Before Action */}
        <div className="space-y-2">
          <Label>Confirm Before Action</Label>
          <Select
            value={config.confirmBeforeAction}
            onValueChange={(val) => handleChange("confirmBeforeAction", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes Please</SelectItem>
              <SelectItem value="dont">No Need</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
