import { RegrasFreteEditPage } from '../../../../../resources/regras-frete/pages/regras-frete-edit-page';

interface EditRegraFretePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRegraFretePage({
  params,
}: EditRegraFretePageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return <RegrasFreteEditPage id={id} />;
}
