import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const goto = (p: number) => onPageChange?.(Math.max(1, Math.min(pageCount, p)));

  const pages = Array.from({ length: pageCount }).map((_, i) => i + 1);

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <Button variant="secondary" disabled={!canPrev} onClick={() => goto(page - 1)}>Précédent</Button>
      <div className="flex items-center gap-1">
        {pages.map(p => (
          <Button key={p} variant={p === page ? "default" : "secondary"} size="sm" onClick={() => goto(p)}>
            {p}
          </Button>
        ))}
      </div>
      <Button variant="secondary" disabled={!canNext} onClick={() => goto(page + 1)}>Suivant</Button>
    </div>
  );
}
