"use client";

import Link from "next/link";
import { ChevronDown, LogOut, User, Users } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { useCurrentUser } from "@/components/auth/current-user-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const user = useCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[140px] truncate">{user.fullName}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
          <p className="text-xs font-normal text-muted-foreground">
            {user.username} · {user.role === "admin" ? "Administrador" : "Usuário"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <User className="w-3.5 h-3.5" />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/usuarios">
              <Users className="w-3.5 h-3.5" />
              Gerenciar usuários
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout()}>
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
