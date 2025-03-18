"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from "date-fns";
import { Pencil, Trash2, ArrowLeft, Plus, Calendar, Tag, Percent, Clock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";

// Import dialog components
import AddOfferDialog from '@/components/dialog/AddOfferDialog';
import EditOfferDialog from '@/components/dialog/EditOfferDialog';
import DeleteOfferDialog from '@/components/dialog/DeleteOfferDialog';

// Form validation schema
const offerFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  couponCode: z.string().optional(),
  discountPercent: z.coerce.number().int().min(1).max(100).optional(),
  active: z.boolean().default(true),
});

export default function BrandOffersPage() {
  const params = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);

  const form = useForm({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: undefined,
      couponCode: "",
      discountPercent: 0,
      active: true,
    },
  });

  // Fetch brand and offers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brand details
        const brandResponse = await fetch(`/api/admin/brands/${params.id}`);
        if (!brandResponse.ok) throw new Error("Failed to fetch brand details");
        const brandData = await brandResponse.json();
        setBrand(brandData.brand);

        // Fetch offers
        const offersResponse = await fetch(`/api/admin/brands/${params.id}/offers`);
        if (!offersResponse.ok) throw new Error("Failed to fetch offers");
        const offersData = await offersResponse.json();
        setOffers(offersData.offers || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleAddOffer = async (data) => {
    try {
      const response = await fetch(`/api/admin/brands/${params.id}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add offer");
      
      const newOffer = await response.json();
      setOffers([newOffer, ...offers]);
      toast.success("Offer added successfully");
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding offer:", error);
      toast.error("Failed to add offer");
    }
  };

  const handleEditOffer = async (data) => {
    try {
      const response = await fetch(`/api/admin/offers/${currentOffer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) throw new Error("Failed to update offer");
      
      const responseData = await response.json();
      // The API returns { offer: updatedOffer } but the component expects just updatedOffer
      const updatedOffer = responseData.offer;
      
      setOffers(offers.map(offer => 
        offer.id === updatedOffer.id ? updatedOffer : offer
      ));
      toast.success("Offer updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("Failed to update offer");
    }
  };

  const handleDeleteOffer = async () => {
    try {
      const response = await fetch(`/api/admin/offers/${currentOffer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete offer");
      
      setOffers(offers.filter(offer => offer.id !== currentOffer.id));
      toast.success("Offer deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const openEditDialog = (offer) => {
    setCurrentOffer(offer);
    form.reset({
      title: offer.title,
      description: offer.description,
      startDate: offer.startDate ? new Date(offer.startDate) : new Date(),
      endDate: offer.endDate ? new Date(offer.endDate) : undefined,
      couponCode: offer.couponCode || "",
      discountPercent: offer.discountPercent || 0,
      active: offer.active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (offer) => {
    setCurrentOffer(offer);
    setIsDeleteDialogOpen(true);
  };

  const openAddDialog = () => {
    form.reset({
      title: "",
      description: "",
      startDate: new Date(),
      endDate: undefined,
      couponCode: "",
      discountPercent: 0,
      active: true,
    });
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-200"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-blue-600 animate-spin"></div>
          </div>
          <p className="mt-6 text-blue-700 font-medium text-lg">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-6 bg-white rounded-xl shadow-lg"
        >
          <p className="text-xl text-red-500 font-medium">Brand not found</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/admin/brands')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Brands
          </Button>
        </motion.div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container  px-4 mx-auto py-4 md:py-8 max-w-7xl min-h-[100vh]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {brand.name} Offers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage promotional offers and discounts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            onClick={() => router.push(`/admin/brands/${params.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Back to Brand</span>
            <span className="inline md:hidden">Back</span>
          </Button>
          <Button 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors"
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Add New Offer</span>
            <span className="inline md:hidden">New</span>
          </Button>
        </div>
      </motion.div>

      <Separator className="my-4 md:my-6" />

      {offers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-dashed border-2 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                No offers have been created for this brand yet.
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all px-8 py-6 h-auto"
                onClick={openAddDialog}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Offer
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-sm">
              <CardTitle className="flex items-center ">
                <Tag className="h-5 w-5 mr-2" />
                All Offers
              </CardTitle>
              <CardDescription className="text-blue-100">
                {offers.length} offer{offers.length === 1 ? "" : "s"} found for {brand.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Discount</TableHead>
                      <TableHead className="hidden md:table-cell">Coupon</TableHead>
                      <TableHead className="hidden md:table-cell">Start Date</TableHead>
                      <TableHead className="hidden md:table-cell">End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers && offers.map((offer, index) => (
                      <motion.tr
                        key={offer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="group hover:bg-blue-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{offer.title}</span>
                            <span className="md:hidden text-xs text-muted-foreground flex items-center mt-1">
                              <Percent className="h-3 w-3 mr-1" />
                              {offer.discountPercent ? `${offer.discountPercent}%` : "No discount"}
                            </span>
                            <span className="md:hidden text-xs text-muted-foreground flex items-center mt-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {offer.couponCode || "No code"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {offer.discountPercent ? 
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                              <Percent className="h-3 w-3 mr-1" />
                              {offer.discountPercent}%
                            </span> : 
                            <span className="text-muted-foreground">N/A</span>
                          }
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {offer.couponCode ? 
                            <code className="px-2 py-1 rounded bg-gray-100 text-xs font-mono">
                              {offer.couponCode}
                            </code> : 
                            <span className="text-muted-foreground">N/A</span>
                          }
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {offer.startDate ? 
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{format(new Date(offer.startDate), "MMM dd, yyyy")}</span>
                            </div> : 
                            <span className="text-muted-foreground">No start date</span>
                          }
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {offer.endDate ? 
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{format(new Date(offer.endDate), "MMM dd, yyyy")}</span>
                            </div> : 
                            <span className="text-muted-foreground">No end date</span>
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                            offer.active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${offer.active ? "bg-green-500" : "bg-gray-500"}`}></span>
                            {offer.active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => openEditDialog(offer)}
                            >
                              <Pencil className="h-3 w-3 md:mr-1" />
                              <span className="hidden md:inline">Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                              onClick={() => openDeleteDialog(offer)}
                            >
                              <Trash2 className="h-3 w-3 md:mr-1" />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Import dialog components */}
      <AddOfferDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        form={form}
        onSubmit={handleAddOffer}
        brandName={brand?.name}
      />
      
      <EditOfferDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        form={form}
        onSubmit={handleEditOffer}
        currentOffer={currentOffer}
      />
      
      <DeleteOfferDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteOffer}
        currentOffer={currentOffer}
      />
    </div>
  );
}