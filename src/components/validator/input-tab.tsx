"use client";

import { FileText, HelpCircle, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface InputTabProps {
  rawInputText: string;
  onRawInputTextChange: (value: string) => void;
  onFileUpload: (file: File) => void;
}

export function InputTab({ rawInputText, onRawInputTextChange, onFileUpload }: InputTabProps) {
  const lineCount = rawInputText.split("\n").filter((l) => l.trim().length > 0).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Lista de Funcionalidades do RM (1 por linha)
          </label>
          <span className="text-xs text-muted-foreground">{lineCount} linhas identificadas</span>
        </div>

        <Textarea
          value={rawInputText}
          onChange={(e) => onRawInputTextChange(e.target.value)}
          rows={16}
          placeholder="Cole aqui a lista de funcionalidades copiada da coluna A da aba Funcionalidades - RM..."
        />

        <div>
          <Button variant="destructive" onClick={() => onRawInputTextChange("")}>
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Caixa
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary" />
              Carregar de Arquivo (.xlsx / .csv / .txt)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Importe diretamente a lista de funcionalidades exportada do RM ou planilha de perfil.
            </p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-foreground/30 rounded-xl p-6 cursor-pointer hover:bg-accent transition-colors text-center group">
              <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-xs font-medium text-foreground mt-2">Clique para selecionar</span>
              <span className="text-[10px] text-muted-foreground">ou arraste o arquivo até aqui</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.txt,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="bg-muted/40 shadow-none">
          <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-4">
            <h5 className="font-semibold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Instruções &amp; Dicas do Processo
            </h5>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li>
                O algoritmo corrige automaticamente discrepâncias como <code className="text-foreground">[1]</code> para{" "}
                <code className="text-foreground">[01]</code>.
              </li>
              <li>
                Quebras de linha internas (ex: <code className="text-foreground">Clientes \nFornecedores</code>) são
                normalizadas de forma transparente.
              </li>
              <li>Funcionalidades não cadastradas são destacadas em vermelho para intervenção manual.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
