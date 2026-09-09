import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatCard = ({ label, value, note }) => (
  <Card className="gap-2">
    <CardHeader className="pb-0">
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl tabular-nums sm:text-3xl">
        {value}
      </CardTitle>
    </CardHeader>

    {note && (
      <CardContent>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    )}
  </Card>
);

export default StatCard;
