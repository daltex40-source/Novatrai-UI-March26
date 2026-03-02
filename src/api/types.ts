import { z } from "zod";

export const caseStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "WAITING", "CLOSED", "CANCELLED"]);
export const taskStatusSchema = z.enum(["OPEN", "COMPLETED", "OVERDUE"]);
export const approvalDecisionSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const caseSchema = z.object({
  id: z.string(),
  title: z.string(),
  accountName: z.string(),
  status: caseStatusSchema,
  updatedAt: z.string(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: z.string(),
  status: taskStatusSchema,
});

export const approvalSchema = z.object({
  id: z.string(),
  title: z.string(),
  requester: z.string(),
  status: approvalDecisionSchema,
});

export type Case = z.infer<typeof caseSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Approval = z.infer<typeof approvalSchema>;

export type CaseNote = {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
};
