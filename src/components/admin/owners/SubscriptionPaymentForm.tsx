"use client";

import { useActionState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  recordSubscriptionPayment,
  type RecordSubscriptionPaymentState,
} from "@/actions/admin/owners/recordSubscriptionPayment.action";
import { formatDate } from "@/lib/format";
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: RecordSubscriptionPaymentState = {
  error: null,
  success: false,
};

export function SubscriptionPaymentForm({
  ownerId,
  disabled = false,
  payments,
}: {
  ownerId: string;
  disabled?: boolean;
  payments: {
    id: string;
    amount: number;
    period_start: string;
    period_end: string;
  }[];
}) {
  const [state, formAction, pending] = useActionState(
    recordSubscriptionPayment,
    initialState,
  );

  useActionToast(pending, state, {
    successMessage: "تم التسجيل بنجاح",
    successDescription: "تم تسجيل دفعة الاشتراك وتحديث تاريخ الانتهاء",
    errorTitle: "تعذر تسجيل الدفعة",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="size-4.5" />
        </div>
        <div>
          <CardTitle>الاشتراك</CardTitle>
          <CardDescription className="mt-1">
            تسجيل دفعة اشتراك جديدة — يحدّث تاريخ انتهاء الاشتراك تلقائياً
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          action={formAction}
          className="grid gap-4 sm:grid-cols-4"
          key={state.success ? "reset" : "form"}
        >
          <input type="hidden" name="ownerId" value={ownerId} />

          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step="0.01"
              dir="ltr"
              disabled={disabled}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_start">من</Label>
            <Input
              id="period_start"
              name="period_start"
              type="date"
              disabled={disabled}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_end">الى</Label>
            <Input
              id="period_end"
              name="period_end"
              type="date"
              disabled={disabled}
              required
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={disabled || pending}
              className="w-full"
            >
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "جارٍ الحفظ..." : "تسجيل الدفعة"}
            </Button>
          </div>
        </form>

        {payments.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المبلغ</TableHead>
                <TableHead>من</TableHead>
                <TableHead>الى</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell dir="ltr" className="text-end">
                    {payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{formatDate(payment.period_start)}</TableCell>
                  <TableCell>{formatDate(payment.period_end)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
