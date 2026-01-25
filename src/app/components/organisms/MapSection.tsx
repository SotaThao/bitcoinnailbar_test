import { motion } from "motion/react";
import { Gem } from "lucide-react";

export function MapSection() {
  return (
    <section className="relative h-[400px] md:h-[500px] w-full bg-gray-100 border-t border-[#FF9800]">
      <iframe
        src="https://maps.google.com/maps?q=9793+Westheimer+Rd+A,+Houston,+TX+77042+(Bitcoin+Nail+Bar)&hl=en&z=15&output=embed"
        width="100%"
        height="100%"
        style={{
          border: 0,
          filter: "grayscale(0.2) contrast(1.1)",
        }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
        title="Bitcoin Nail Bar Location"
      ></iframe>

      {/* Overlay Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.a
          href="https://www.google.com/maps/place/9793+Westheimer+Rd+A,+Houston,+TX+77042/@29.735324,-95.540653,15z/data=!4m6!3m5!1s0x8640c3162069b59d:0xe2a9250ed041de1a!8m2!3d29.7353237!4d-95.5406532!16s%2Fg%2F11pvcvpj83?hl=vi&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="group text-[14px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="bg-black text-white border border-[#FF9800] hover:bg-[#FF9800] hover:text-black rounded-full px-8 py-4 text-sm md:text-base font-bold tracking-[0.2em] shadow-[0_4px_14px_0_rgba(255,152,0,0.39)] transition-all duration-300 flex items-center gap-3 uppercase whitespace-nowrap">
            <Gem className="h-4 w-4 text-[#FF9800] group-hover:text-black transition-colors" />
            GET DIRECTIONS
          </div>
        </motion.a>
      </div>
    </section>
  );
}