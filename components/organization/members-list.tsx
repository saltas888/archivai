"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getMembers() {
  const response = await fetch("/api/organizations/members");
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export function MembersList() {
  const { data: members = [] } = useQuery({
    queryKey: ["organization-members"],
    queryFn: getMembers,
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.name}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell className="capitalize">{member.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}