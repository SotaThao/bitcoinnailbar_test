import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import {
  ImageDown,
  Calendar,
  MapPin,
  CheckCircle,
  RotateCcw,
  Ticket,
  Phone,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { format } from "date-fns";
import { toast } from "sonner";

interface BookingSuccessTicketProps {
  bookingData: {
    id: string;
    customerName: string;
    customerPhone: string;
    appointmentTime: Date;
    serviceNames: string;
    branchName: string;
  };
  onReset: () => void;
}

export function BookingSuccessTicket({
  bookingData,
  onReset,
}: BookingSuccessTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      const toastId = toast.loading(
        "Generating ticket image...",
      );

      // Wait for fonts and images to load completely
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use html-to-image library for better text rendering
      const dataUrl = await htmlToImage.toPng(
        ticketRef.current,
        {
          backgroundColor: "#0B0F19",
          pixelRatio: 3,
          cacheBust: true,
          style: {
            transform: "none",
          },
        },
      );

      // Convert dataURL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (!blob) {
        toast.error("Failed to generate image", {
          id: toastId,
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `BitcoinNailBar_Ticket_${bookingData.id.split(":")[1] || bookingData.id}.png`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Ticket saved successfully! 📸", {
        id: toastId,
      });
    } catch (error) {
      console.error("Error generating ticket image:", error);
      toast.error(
        "Failed to save ticket. Please try screenshot.",
      );
    }
  };

  const qrData = JSON.stringify({
    id: bookingData.id,
    phone: bookingData.customerPhone,
    name: bookingData.customerName,
    time: bookingData.appointmentTime.toISOString(),
  });

  return (
    <div className="animate-in fade-in zoom-in duration-500 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-500/20 text-green-500 mb-4 ring-1 ring-green-500/50">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#FF9800] mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-400">
          Your appointment has been successfully scheduled.
        </p>
      </div>

      <div
        ref={ticketRef}
        data-ticket-ref
        className="rounded-2xl overflow-hidden relative shadow-2xl"
        style={{
          backgroundColor: "#0B0F19",
          border: "1px solid #27272a",
        }}
      >
        {/* Decorative Top Border */}
        <div
          className="h-2"
          style={{
            background:
              "linear-gradient(to right, #FF9800, #F7931A, #FF9800)",
          }}
        />

        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div
            className="flex justify-between items-start pb-6"
            style={{ borderBottom: "1px solid #27272a" }}
          >
            <div>
              <h3
                className="font-serif text-xl"
                style={{
                  color: "#ffffff",
                  whiteSpace: "normal",
                  wordSpacing: "normal",
                }}
              >
                Bitcoin Nail Bar
              </h3>
              <div
                className="flex items-center gap-2 text-sm mt-1"
                style={{ color: "#9ca3af" }}
              >
                <MapPin
                  className="w-3 h-3"
                  style={{ color: "#FF9800" }}
                />
                <span
                  style={{
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  {bookingData.branchName}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="block text-xs uppercase tracking-wider"
                style={{
                  color: "#6b7280",
                  whiteSpace: "normal",
                  letterSpacing: "0.05em",
                }}
              >
                Status
              </span>
              <span
                className="inline-block px-2 py-1 rounded text-xs font-bold mt-1"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#4ade80",
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                CONFIRMED
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <QRCodeSVG
                value={qrData}
                size={180}
                level="Q"
                includeMargin={false}
                imageSettings={{
                  src: "https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/public/NailPage/Symbol.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <p
              className="text-xs mt-3 text-center max-w-[200px]"
              style={{
                color: "#6b7280",
                whiteSpace: "normal",
                wordSpacing: "normal",
                lineHeight: "1.4",
              }}
            >
              Scan this code at the kiosk to check in
              automatically.
            </p>
            
            {/* Save Button Below QR Code */}
            <Button
              onClick={handleDownload}
              className="mt-4 bg-[#FF9800] hover:bg-[#FF9800]/90 text-white font-bold h-11 px-8 shadow-[0_0_20px_rgba(255,152,0,0.3)] hover:shadow-[0_0_30px_rgba(255,152,0,0.5)] transition-all rounded-full"
            >
              <ImageDown className="w-4 h-4 mr-2" />
              Save Tickets
            </Button>
          </div>

          {/* Details */}
          <div className="space-y-4 text-sm">
            <div
              className="flex justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.5)",
                border: "1px solid rgba(39, 39, 42, 0.5)",
              }}
            >
              <div
                className="flex items-center gap-3"
                style={{ color: "#9ca3af" }}
              >
                <User
                  className="w-4 h-4"
                  style={{ color: "#FF9800" }}
                />
                <span
                  style={{
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  Guest
                </span>
              </div>
              <span
                className="font-medium"
                style={{
                  color: "#ffffff",
                  whiteSpace: "normal",
                  wordSpacing: "normal",
                }}
              >
                {bookingData.customerName}
              </span>
            </div>

            <div
              className="flex justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.5)",
                border: "1px solid rgba(39, 39, 42, 0.5)",
              }}
            >
              <div
                className="flex items-center gap-3"
                style={{ color: "#9ca3af" }}
              >
                <Phone
                  className="w-4 h-4"
                  style={{ color: "#FF9800" }}
                />
                <span
                  style={{
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  Phone
                </span>
              </div>
              <span
                className="font-medium"
                style={{
                  color: "#ffffff",
                  whiteSpace: "normal",
                  wordSpacing: "normal",
                }}
              >
                {bookingData.customerPhone}
              </span>
            </div>

            <div
              className="flex justify-between p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.5)",
                border: "1px solid rgba(39, 39, 42, 0.5)",
              }}
            >
              <div
                className="flex items-center gap-3"
                style={{ color: "#9ca3af" }}
              >
                <Calendar
                  className="w-4 h-4"
                  style={{ color: "#FF9800" }}
                />
                <span
                  style={{
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  Time
                </span>
              </div>
              <div className="text-right">
                <span
                  className="block font-medium"
                  style={{
                    color: "#ffffff",
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  {format(bookingData.appointmentTime, "PPP")}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: "#FF9800",
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  {format(bookingData.appointmentTime, "p")}
                </span>
              </div>
            </div>

            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.5)",
                border: "1px solid rgba(39, 39, 42, 0.5)",
              }}
            >
              <div
                className="flex items-center gap-3 mb-2"
                style={{ color: "#9ca3af" }}
              >
                <Ticket
                  className="w-4 h-4"
                  style={{ color: "#FF9800" }}
                />
                <span
                  style={{
                    whiteSpace: "normal",
                    wordSpacing: "normal",
                  }}
                >
                  Services
                </span>
              </div>
              <p
                className="font-medium pl-7 text-sm leading-relaxed"
                style={{
                  color: "#ffffff",
                  whiteSpace: "normal",
                  wordSpacing: "normal",
                  lineHeight: "1.6",
                }}
              >
                {bookingData.serviceNames}
              </p>
            </div>
          </div>

          <div
            className="text-center text-[10px] font-mono"
            style={{ color: "#52525b" }}
          >
            ID: {bookingData.id.split(":")[1] || bookingData.id}
          </div>
        </div>

        {/* Ticket Cutout Effect */}
        <div
          className="absolute top-1/2 -left-3 w-6 h-6 rounded-full"
          style={{ backgroundColor: "#000000" }}
        />
        <div
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full"
          style={{ backgroundColor: "#000000" }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 relative overflow-hidden group bg-transparent hover:bg-transparent border-[#FF9800] text-[#FF9800] hover:text-white transition-colors duration-300 h-12 rounded-full"
        >
          <span className="absolute inset-0 w-full h-full bg-[#FF9800] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center justify-center gap-2 w-full">
            <RotateCcw className="w-4 h-4" />
            Book Another
          </span>
        </Button>
      </div>
    </div>
  );
}