import { Link } from "react-router";
import { motion } from "motion/react";
import { PrimaryButton } from "../PrimaryButton";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useLanguage } from "../../context/LanguageContext";
import { ASSETS } from "../../config/assets";

// These assets are stored for when this component is re-enabled:
// ASSETS.serviceManicure, ASSETS.servicePedicure, ASSETS.serviceCombo, ASSETS.serviceSpecial, ASSETS.serviceSpa

export function ServicesSection() {
  const { t } = useLanguage();

  return null; // Temporarily hidden
  /*
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-6 font-serif">{t('home.main_services.title')}</h2>
          <p className="text-xl text-[#FF9800] max-w-3xl mx-auto">
            {t('home.main_services.subtitle')}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-7xl mx-auto"
        >
          {[
            { name: t('home.main_services.classic_manicure'), image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=300&h=300&fit=crop' },
            { name: t('home.main_services.gel_manicure'), image: image_41a58bb299d35b49e46df2890074430c728972c1 },
            { name: t('home.main_services.spa_pedicure'), image: image_ea3be441ab727782ea25f3a0f385538edfb86ce6 },
            { name: t('home.main_services.nail_art'), image: image_e9fb9c0c13fe1065d00d86ae9ec5a02351b4726f },
            { name: t('home.main_services.acrylic_nails'), image: image_4c53ac85990ea0966b502d0b4c5cd5321aa1c6ed },
            { name: t('home.main_services.nail_extensions'), image: image_5265af93fe0f75760ddaadd5dadb234d4d5ede1b },
          ].map((service, index) => (
            <motion.div 
              key={service.name} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group cursor-pointer"
            >
              <div className="relative mb-4 overflow-hidden rounded-full w-32 h-32 mx-auto shadow-lg group-hover:shadow-xl transition-shadow border-2 border-transparent group-hover:border-primary">
                <ImageWithFallback
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold">{service.name}</h3>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/services">
            <PrimaryButton size="lg" className="bg-white text-black border-2 border-black hover:bg-black hover:text-white hover:shadow-none hover:scale-105 active:scale-95 shadow-none">
              {t('home.main_services.view_all')}
            </PrimaryButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
  */
}