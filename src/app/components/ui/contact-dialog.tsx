import { Phone, Mail, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ContactDialog({
  open,
  onOpenChange,
  title = "Contact Us",
  description = "Get in touch with us through any of these channels.",
}: ContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1F2E] text-white border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FF9800] text-center mb-2">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <a
              href="tel:+13468024906"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF9800]/20 flex items-center justify-center text-[#FF9800] group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Call Us
                </p>
                <p className="text-lg font-bold text-white group-hover:text-[#FF9800] transition-colors">
                  (346) 802-4906
                </p>
              </div>
            </a>

            <a
              href="mailto:customerbitcoinnailbar@gmail.com"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF9800]/20 flex items-center justify-center text-[#FF9800] group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Email Us
                </p>
                <p className="text-lg font-bold text-white group-hover:text-[#FF9800] transition-colors">
                  customerbitcoinnailbar@gmail.com
                </p>
              </div>
            </a>

            <a
              href="https://maps.app.goo.gl/B3gJxRD3A5aruYcd6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF9800]/20 flex items-center justify-center text-[#FF9800] group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Visit Us
                </p>
                <p className="text-sm font-bold text-white group-hover:text-[#FF9800] transition-colors">
                  9793 Westheimer Rd, Houston, TX 77042
                </p>
              </div>
            </a>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 italic">
              Our team will assist you with any inquiries you
              may have.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}