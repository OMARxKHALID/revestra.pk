"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { request } from "@/lib/api-client";

const NewsletterComposer = ({ subscribers, emailConfigured }) => {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: (test) =>
      request("/api/admin/newsletter", { body: { subject, body, test } }),
    onSuccess: (result, test) => {
      if (test) {
        toast.success("Test sent to your account email");
        return;
      }

      toast.success(
        result.failed > 0
          ? `Sent to ${result.sent}, ${result.failed} failed`
          : `Sent to ${result.sent} subscribers`
      );
      setSubject("");
      setBody("");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleTest = () => send.mutate(true);
  const handleSend = () => {
    if (
      window.confirm(
        `Send "${subject}" to ${subscribers} ${subscribers === 1 ? "subscriber" : "subscribers"}?`
      )
    )
      send.mutate(false);
  };

  const ready = subject.trim().length >= 3 && body.trim().length >= 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a newsletter</CardTitle>
        <CardDescription>
          Plain text, sent to everyone on the list. Every message carries an
          unsubscribe link.
          {!emailConfigured && " Set RESEND_API_KEY to send for real."}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="newsletter-subject">Subject</Label>
          <Input
            id="newsletter-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="New in: winter jackets"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newsletter-body">Message</Label>
          <Textarea
            id="newsletter-body"
            rows={8}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Twelve jackets went up this morning, all measured and washed."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={!ready || send.isPending}
          >
            Send a test to me
          </Button>

          <Button
            type="button"
            onClick={handleSend}
            disabled={!ready || send.isPending || subscribers === 0}
          >
            {send.isPending
              ? "Sending…"
              : `Send to ${subscribers} ${subscribers === 1 ? "subscriber" : "subscribers"}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterComposer;
