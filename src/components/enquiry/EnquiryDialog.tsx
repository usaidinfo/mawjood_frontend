'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { enquiryService, CreateEnquiryData } from '@/services/enquiry.service';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface EnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
}

export function EnquiryDialog({ open, onOpenChange, businessId, businessName }: EnquiryDialogProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEnquiryData & { message: string }>({
    businessId,
    name: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    email: user?.email || '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to send an enquiry');
      return;
    }

    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Only include message if it's not empty
      const enquiryData: CreateEnquiryData = {
        businessId: formData.businessId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        ...(formData.message?.trim() && { message: formData.message.trim() }),
      };
      await enquiryService.createEnquiry(enquiryData);
      toast.success('Enquiry submitted successfully! The business owner will contact you soon.');
      setFormData({
        businessId,
        name: user ? `${user.firstName} ${user.lastName}` : '',
        phone: user?.phone || '',
        email: user?.email || '',
        message: '',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Enquiry to {businessName}</DialogTitle>
          <DialogDescription>
            Fill in the form below to send an enquiry to the business owner. They will contact you soon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Your full name"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="+966 5XX XXX XXX"
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell the business owner what you're looking for... (optional)"
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Enquiry'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

