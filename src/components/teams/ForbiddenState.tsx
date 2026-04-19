import { ForbiddenState as BaseForbiddenState } from "@/components/ForbiddenState";

export const ForbiddenState = () => {
  return (
    <BaseForbiddenState
      title="You don't have access to this team"
      subtitle="This team isn't in your scope. Ask an admin if you believe this is a mistake."
      ctaLabel="Back to Teams"
      ctaHref="/teams"
    />
  );
};
