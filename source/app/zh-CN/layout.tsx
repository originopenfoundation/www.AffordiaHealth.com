import { DocumentLayout, baseMetadata } from '../document-layout';
export const metadata = baseMetadata;
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocumentLayout locale="zh-CN">{children}</DocumentLayout>;
}
