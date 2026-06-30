import ContractorSidebar from "@/components/layout/ContractorSidebar";

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContractorSidebar>
      {children}
    </ContractorSidebar>
  );
}
