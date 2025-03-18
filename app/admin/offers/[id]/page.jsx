// app/admin/offers/[id]/page.jsx
import OfferForm from '@/components/OfferForm';

export default async function EditOfferPage({ params }) {
  const { id } = await params;
  return <OfferForm offerId={id} />;
}