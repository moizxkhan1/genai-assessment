import LabView from "@/app/lab/components";
import { generateResponsesAction } from "@/app/actions";

export const runtime = "nodejs";

export default function Home() {
  return (
    <div className="space-y-6">
      <LabView action={generateResponsesAction} />
    </div>
  );
}
