export type Language = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

export const languageNames = {
  en: "English",
  vi: "Tiếng Việt",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語"
};

export const translations = {
  en: {
    nav: {
      home: "Home",
      about_us: "About Us",
      services: "Services",
      promotions: "Promotions",
      egift: "E-GIFT",
      membership: "Membership",
      careers: "Careers",
      gallery: "Gallery",
      booking: "Book Appointment",
      staff: "Staff",
      locations: "Locations",
      reviews: "Reviews",
      contact: "CONTACT"
    },
    bottom_nav: {
      home: "Home",
      services: "Services",
      booking: "Book",
      membership: "Membership",
      egift: "E-Gift"
    },
    chatbot: {
      online: "Online",
      input_placeholder: "Ask about services...",
      welcome: "Hello! Welcome to Bitcoin Nail Bar. 💅✨ I can help you find the perfect luxury treatment or book your appointment. What can I do for you today?",
      error: "I'm having a bit of trouble connecting to the network right now. Please try again in a moment!",
      bubbles: [
        "Hello! Could I help you? 👋",
        "Need help booking? 💅",
        "Discover our luxury spa! ✨",
        "We are here to assist you! 💬"
      ]
    },
    home: {
      badge: "THE FIRST BITCOIN NAIL SALON IN THE USA",
      hero_unlock: "Unlock",
      hero_vip_status: "VIP Status",
      hero_get_rewards: "Get Rewards",
      hero_desc_new_1: "Elevate your beauty experience with our",
      hero_membership_program: "Membership Program",
      hero_enjoy_up_to: "Enjoy up to",
      hero_cashback_20: "20% Cashback",
      hero_priority_access: "priority booking, and exclusive access.",
      cta_view_packages: "VIEW PACKAGES",
      cta_design_card: "DESIGN YOUR CARD",
      card_valid_thru: "VALID THRU",
      card_10_off: "10% OFF",
      card_vip_membership: "VIP MEMBERSHIP",
      card_cashback: "CASHBACK",
      hero_title_1: "Luxury",
      hero_title_2: "Beauty",
      hero_title_3: "Innovation",
      hero_desc_1: "Where high-end nail artistry meets the elite",
      hero_desc_1_bold: "Crypto community",
      hero_desc_2: "Experience the first",
      hero_desc_2_bold_1: "10,000 SQFT",
      hero_desc_2_part_2: "space in the US to accept",
      hero_desc_2_bold_2: "Crypto payments",
      cta_book: "BOOK APPOINTMENT",
      cta_vip: "JOIN VIP CLUB",

      features_section: {
        crypto_payments: {
          title: "Crypto Payments",
          subtitle: "Accepting Bitcoin, USDT, VLINKPAY.",
          description: "Fast & Absolutely Secure."
        },
        bar_cocktails: {
          title: "Bar & Cocktails",
          subtitle: "Enjoy free drinks at our luxury Bar",
          description: "while relaxing."
        },
        medical_hygiene: {
          title: "Medical Hygiene",
          subtitle: "Hospital-grade Autoclave sterilization",
          description: "process. Safety first."
        },
        large_space: {
          title: "10,000+ SQF",
          subtitle: "The largest space in Houston,",
          description: "designed for privacy and class."
        }
      },
      
      bnb_section: {
        card_title: "Crypto Networking",
        card_desc: "Every Sunday at the Lounge",
        card_btn: "Join Us",
        badge: "Future of Beauty",
        title_1: "Bitcoin Nail Bar",
        title_2: "First & Only",
        desc: "At Bitcoin Nail Bar, we don't just do beauty. We create an ecosystem where art meets technology. Paying for services with your investment profits has never been so stylish.",
        feature_1_title: "Crypto Knowledge",
        feature_1_desc: "Network with experts, update market trends while enjoying Spa Pedicure services.",
        feature_2_title: "Payment 4.0",
        feature_2_desc: "Scan QR code and pay instantly with Bitcoin, ETH, USDT or VLinkPay wallet. No cash, no hassle.",
        btn_register: "REGISTER VLINKPAY"
      },
      
      about: {
        badge: "About Us",
        title: "The First Bitcoin-Branded Luxury Nail Bar in the World",
        desc_1: "Bitcoin Nail Bar™ is the first-ever beauty lounge in the world built under the Bitcoin brand—setting a new standard by merging luxury, artistry, and blockchain technology.",
        desc_2: "Spanning over 10,000 SQFT, our space is designed as a High-End Beauty Experience Center, where clients step into a future-forward environment combining elegant aesthetics with the freedom of modern digital payments.",
        desc_3: "Here, beauty meets innovation. Clients can enjoy premium nail care, spa services, lashes, massage, and a full relaxation lounge—all elevated by a futuristic design and seamless crypto payment options.",
        
        vision: {
          title: "OUR VISION",
          desc: "To redefine the global beauty industry by becoming the world's leading Beauty-Tech Nail Bar, where:",
          items: [
            "Luxury aesthetics meet cutting-edge blockchain",
            "Crypto becomes a natural part of everyday life",
            "Customers enjoy a smart, secure, and modern service experience",
            "Innovation shapes how beauty services operate in the future"
          ]
        },
        mission: {
          title: "OUR MISSION",
          items: [
             { title: "Bring Crypto Into Everyday Beauty", desc: "First in U.S. to accept BTC, ETH, USDT, VMM, USDV. Making crypto practical & accessible." },
             { title: "Luxury Experience at Scale", desc: "10,000 SQFT lounge, resort-style interiors, and top-tier hygiene standards." },
             { title: "Build Forward-Thinking Community", desc: "Connecting pioneers who embrace technology and modern luxury lifestyle." },
             { title: "Empower Professionals", desc: "Excellent compensation, skill development, and a respectful career environment." }
          ]
        }
      },
      
      hygiene: {
        badge: "Health & Safety First",
        title: "Hygiene Nail Bar",
        desc: "Your health and safety are our top priorities. We maintain the highest standards of hygiene and sanitation, exceeding industry regulations.",
        items: [
          "Autoclave sterilization",
          "Single-use files & buffers",
          "Medical-grade disinfection",
          "Individual tool kits",
          "HEPA air filtration",
          "UV sanitization",
          "Disposable liners",
          "Licensed technicians"
        ]
      },
      
      services: {
        badge: "Premium Services",
        title: "Signature Treatments",
        desc: "Experience the convergence of luxury and technology. Our signature treatments incorporate precious elements like 24K gold and diamond dust, payable directly with your preferred cryptocurrency.",
        items: [
          "Bitcoin Gold Pedicure",
          "Private VIP Suites",
          "Diamond Gel Manicure",
          "Blockchain-Verified Products",
          "Crypto Glow Facial",
          "Instant Lightning Payments",
          "Deep Tissue Recovery",
          "Exclusive NFT Membership"
        ],
        btn: "Explore Menu"
      },
      promotions: {
        badge: "Limited Time Offers",
        title: "Exclusive Promotions",
        card_1: {
          title: "20% OFF",
          subtitle: "GRAND OPENING",
          desc: "Celebrate our launch with 20% off all services for your first visit. Experience luxury for less.",
          btn: "Book Now"
        },
        card_2: {
          badge: "POPULAR",
          title: "FREE",
          subtitle: "COCKTAILS & DRINKS",
          desc: "Enjoy complimentary premium cocktails, champagne, or soft drinks with any service over $50.",
          btn: "View Menu"
        },
        card_3: {
          title: "$20 GIFT",
          subtitle: "REFER A FRIEND",
          desc: "Bring a friend and both of you receive a $20 voucher for your next visit. Sharing is caring!",
          btn: "Join Club"
        }
      },
      vip_club: {
        badge: "Bitcoin VIP Club",
        title_1: "Join VIP Club &",
        title_2: "Get Exclusive Rewards",
        desc_part_1: "Become a member of",
        desc_part_2: "to enjoy exclusive privileges reserved for loyal customers and crypto holders.",
        feature_1_title: "5% Cashback Points",
        feature_1_desc: "Receive 5% of the bill value into your member account for every service use.",
        feature_2_title: "Birthday Gifts",
        feature_2_desc: "Free premium Spa Pedicure service during your birthday month.",
        form: {
          title: "Join Elite Club",
          subtitle: "Unlock the future of beauty services",
          name_label: "Full Name",
          name_placeholder: "Enter your full name",
          phone_label: "Phone Number",
          phone_placeholder: "Enter phone number",
          btn: "Register For Free",
          footer: "We commit to absolute information security."
        }
      },

      membership: {
        badge: "YOUR LOOK",
        title: "Annual Membership Packages",
        most_popular: "MOST POPULAR",
        save: "SAVE",
        entry_level: "ENTRY LEVEL",
        period: "/year",
        valued_at: "VALUED AT",
        redeem_prompt: "Already paid? Activate your membership now",
        plans: {
          silver: {
            name: "SILVER",
            subtitle: "ENTRY LEVEL",
            button: "JOIN SILVER",
            features: [
              "Access to Member Pricing",
              "10% Cashback in Bitcoin",
              "Free Gel Removal",
              "Birthday Gift ($25)"
            ]
          },
          gold: {
            name: "GOLD",
            subtitle: "GOLD",
            button: "JOIN GOLD",
            features: [
              "$50 Monthly Credit",
              "10% Cashback on Services",
              "Priority Booking",
              "25% Discount on Birthday"
            ]
          },
          platinum: {
            name: "PLATINUM",
            subtitle: "PLATINUM",
            button: "JOIN PLATINUM",
            features: [
              "$60 Monthly Credit",
              "15% Cashback on Services",
              "VIP Lounge Access",
              "Premium Drinks Included"
            ]
          },
          vip_crypto: {
            name: "VIP CRYPTO",
            subtitle: "VIP CRYPTO",
            button: "JOIN VIP",
            features: [
              "$80 Monthly Credit",
              "20% Cashback (Best Value)",
              "All Inclusive Perks",
              "Crypto Payment Bonus"
            ]
          }
        }
      },
      
      why_exists: {
        title: "WHY BITCOIN NAIL BAR™ EXISTS",
        subtitle_1: "The beauty industry is evolving.",
        subtitle_2: "Consumers are evolving.",
        subtitle_3: "Technology is evolving.",
        lead: "Bitcoin Nail Bar™ was created to set a new benchmark:",
        feature_1: "A luxury nail lounge on a scale rarely seen",
        feature_2: "A futuristic brand powered by blockchain culture",
        feature_3_title: "Crypto Payments Accepted",
        feature_3_desc: "Fast, secure payments with Bitcoin & major alts. Zero friction.",
        feature_4: "The first nail bar to proudly carry the Bitcoin name",
        feature_5: "A 10,000 SQFT space redefining what a nail salon can be",
        cta_line_1: "We are not just opening a nail bar.",
        cta_line_2: "We are building an icon."
      },
      
      main_services: {
        title: "Main Services",
        subtitle: "Explore our comprehensive range of premium nail care treatments",
        classic_manicure: "Classic Manicure",
        gel_manicure: "Gel Manicure",
        spa_pedicure: "Spa Pedicure",
        nail_art: "Nail Art",
        acrylic_nails: "Acrylic Nails",
        nail_extensions: "Nail Extensions",
        view_all: "View All Services"
      }
    },
    coming_soon: {
      status: "In Progress",
      title_1: "Something Extraordinary",
      title_2: "Is Coming",
      desc: "We are crafting a revolutionary experience for our locations and reviews system. The future of luxury beauty tech is worth the wait.",
      return_home: "Return Home",
      book_now: "Book Now"
    },
    booking_page: {
      subtitle: "Choose your services and preferred time. We'll take care of the rest!",
      back: "Back",
      steps: {
        services: "Select Services",
        services_desc: "Choose one or more services you'd like to book",
        time: "Select Date & Time",
        time_desc: "Choose your preferred appointment time",
        technician: "Select Technician",
        details: "Your Details",
        details_desc: "Please provide your contact details",
        confirm: "Confirmation"
      },
      technician: {
        desc: "Choose your preferred expert",
        no_preference: "No Preference",
        no_preference_desc: "We'll assign the next available senior technician"
      },
      form: {
        name: "Full Name",
        phone: "Phone Number",
        email: "Email Address",
        optional: "(Optional)",
        request: "Special Requests (Optional)",
        notes: "Notes",
        notes_placeholder: "Any special requests or notes...",
        confirm: "Confirm Booking",
        confirm_book: "Confirm Booking",
        continue: "Continue"
      },
      services: {
        loading: "Loading services...",
        all: "All Services",
        select_continue: "Select a Service to Continue",
        no_category: "No services found in this category.",
        total_estimated: "Total Estimated:"
      },
      time: {
        select_date: "Select Date",
        select_time: "Select Time",
        no_slots: "No available slots for today.",
        choose_another_day: "Please choose another day."
      },
      summary: {
        title: "Booking Summary",
        services: "Services:",
        date: "Date:",
        time: "Time:",
        technician: "Technician:",
        total: "Total:"
      },
      processing: "Processing...",
      errors: {
        required_fields: "Please fill in all required fields",
        booking_failed: "Failed to book appointment. Please try again.",
        general: "An error occurred. Please try again."
      },
      success: "Booking Confirmed!"
    },
    service_translations: {
      classic_manicure: {
        name: "Classic Manicure",
        description: "Shape, buff, cuticle care, and polish"
      },
      gel_manicure: {
        name: "Gel Manicure",
        description: "Long-lasting gel polish"
      },
      spa_pedicure: {
        name: "Spa Pedicure",
        description: "Ultimate foot care experience"
      },
      nail_art_design: {
        name: "Nail Art Design",
        description: "Custom artistic designs"
      },
      acrylic_nails: {
        name: "Acrylic Nails",
        description: "Durable acrylic extensions"
      },
      nail_extensions: {
        name: "Nail Extensions",
        description: "Beautiful length and shape"
      },
      duration_unit: "min"
    },
    services_page: {
      hero_title: "World Class",
      hero_title_highlight: "Services",
      hero_desc: "Experience the pinnacle of luxury with our Bitcoin-inspired treatments.",
      art_title: "The Art of",
      art_highlight: "Modern Nail Care",
      art_desc: "At Bitcoin Nail Bar, every service is an experience. We combine traditional techniques with modern technology to ensure precision, hygiene, and lasting beauty.",
      premium_materials: "Premium Materials",
      premium_desc: "We use only organic, non-toxic polishes.",
      menu_title: "Our Menu",
      service_menu: {
        title: "Service Menu",
        subtitle: "Comprehensive Care",
        headers: {
          service: "Service",
          regular: "Regular",
          member: "Member"
        },
        categories: {
          acrylic: "Acrylic Nail Services",
          dipping: "Dipping Powder",
          gel: "Gel Shellac Service",
          waxing: "Waxing Services",
          pedicure: "Pedicure",
          manicure: "Manicure",
          kids: "Kids Services",
          additional: "Additional Services"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "FULL SET",
                items: [
                  { name: "Acrylic with polish", regular: 45, member: 35 },
                  { name: "White or pear tip", regular: 45, member: 35 },
                  { name: "Pink powder only", regular: 45, member: 35 },
                  { name: "Powder solid color", regular: 45, member: 35 },
                  { name: "Acrylic with shellac", regular: 50, member: 40 },
                  { name: "Pink & white", regular: 55, member: 45 },
                  { name: "Ombre full 2 color", regular: 55, member: 45 },
                  { name: "Ombre 3 color", regular: 60, member: 50 }
                ]
              },
              {
                name: "ACRYLIC NAIL REFILL",
                items: [
                  { name: "Refill the Same color", regular: 35, member: 30 },
                  { name: "Change color", regular: 40, member: 33 },
                  { name: "Acrylic refill w/ shellac", regular: 45, member: 35 },
                  { name: "Pink & white refill", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "DIPPING POWDER",
                items: [
                  { name: "Dip Overlay", regular: 45, member: 40 },
                  { name: "Dip Full Set", regular: 50, member: 45 },
                  { name: "Dip Pink & White", regular: 55, member: 50 },
                  { name: "Dip Ombre", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "GEL SERVICES",
                items: [
                  { name: "Gel Manicure", regular: 40, member: 35 },
                  { name: "Gel Pedicure", regular: 50, member: 45 },
                  { name: "Gel Polish Change (Hands)", regular: 25, member: 20 },
                  { name: "Gel Polish Change (Feet)", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "FACE",
                items: [
                  { name: "Eyebrows", regular: 15, member: 12 },
                  { name: "Lip", regular: 10, member: 8 },
                  { name: "Chin", regular: 12, member: 10 },
                  { name: "Full Face", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "PEDICURE TREATMENTS",
                items: [
                  { name: "Classic Pedicure", regular: 35, member: 30 },
                  { name: "Deluxe Pedicure", regular: 50, member: 45 },
                  { name: "Bitcoin Signature Pedicure", regular: 75, member: 65 },
                  { name: "Volcano Spa Pedicure", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "MANICURE TREATMENTS",
                items: [
                  { name: "Classic Manicure", regular: 25, member: 20 },
                  { name: "Deluxe Manicure", regular: 35, member: 30 },
                  { name: "Bitcoin Signature Manicure", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "FOR KIDS (Under 10)",
                items: [
                  { name: "Manicure", regular: 15, member: 12 },
                  { name: "Pedicure", regular: 25, member: 22 },
                  { name: "Polish Change (Hands)", regular: 10, member: 8 },
                  { name: "Polish Change (Feet)", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "ADD-ONS",
                items: [
                  { name: "Nail Repair", regular: 5, member: 0 },
                  { name: "Nail Removal", regular: 15, member: 10 },
                  { name: "Paraffin Wax", regular: 10, member: 8 },
                  { name: "Callus Removal", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "Book This Category",
      find_location: "Find Nearest Location",
      book_appointment: "Book Your Appointment",
      ready_title: "Ready to Experience the Future?",
      ready_desc: "Join the thousands of clients who have switched to the Bitcoin Nail Bar standard.",
      categories: {
        signature: {
          title: "Signature Treatments",
          desc: "Experience the pinnacle of luxury with our Bitcoin-inspired treatments.",
          items: [
            { name: "Bitcoin Gold Pedicure", price: "$150", desc: "24K Gold soak, CBD infusion, deep tissue massage." },
            { name: "Diamond Gel Manicure", price: "$85", desc: "Real diamond dust exfoliation with premium gel finish." },
            { name: "Crypto Glow Facial", price: "$120", desc: "LED therapy combined with organic enzyme peel." }
          ]
        },
        comprehensive: {
          title: "Comprehensive Care",
          desc: "Essential care elevated to a luxury standard.",
          items: [
            { name: "Classic Manicure", price: "$45", desc: "Cuticle care, massage, and regular polish." },
            { name: "Gel Polish Change", price: "$35", desc: "Removal and application of premium gel color." },
            { name: "Acrylic Full Set", price: "$75+", desc: "Sculpted extensions with precision shaping." },
            { name: "Nail Art", price: "$15+", desc: "Custom designs, gems, and artistic nail enhancements." }
          ]
        }
      },
      no_services: "No services available"
    },
    footer: {
      desc: "Premium nail care services with a futuristic twist. The world's first crypto-integrated luxury salon.",
      accept: "We Accept",
      quick_links: "Quick Links",
      popular_services: "Popular Services",
      contact: "Contact Us",
      rights: "All rights reserved."
    },
    careers: {
      badge: "CAREERS & OPPORTUNITIES",
      title: "Join The Elite Team",
      desc: "Are you a talented nail technician or beauty expert looking for a prestigious environment to showcase your skills? Bitcoin Nail Bar offers the most competitive compensation package in the industry.",
      features: [
        "High Commission + 100% Tips",
        "Modern, high-tech working environment (10,000 SQFT)",
        "Continuous training & skill development",
        "Flexible shifts & supportive management"
      ],
      cta: "APPLY TODAY",
      salary_badge_title: "Highest Pay",
      salary_badge_subtitle: "IN THE HOUSTON AREA"
    },
    ready_cta: {
      instagram: "FOLLOW US ON INSTAGRAM",
      title: "Ready to Transform Your Look?",
      desc: "Book your appointment today and experience the pinnacle of luxury nail care. Your journey to beautiful, healthy nails starts here.",
      btn_book: "Book Appointment Now",
      btn_explore: "Explore Services"
    },
    egift: {
      badge: "THE PERFECT GIFT",
      desc: "Surprise your loved ones with a digital key to relaxation. Delivered instantly via Email/SMS.",
      send: "Send",
      luxury: "LUXURY",
      instantly: "Instantly",
      ai_messages: [
        "Wishing you a relaxing day filled with pampering and joy!",
        "Treat yourself to the luxury you deserve. Enjoy!",
        "A little something to brighten your day. Best wishes!",
        "Relax, refresh, and recharge. You've earned it!",
        "Sending you love and a moment of pure bliss."
      ]
    },
    redeem: {
      badge: "Redeem Your Code",
      title: "Activate Membership",
      subtitle: "Payment successful? Enter your redeem code from email to activate your membership package",
      instructions: {
        title: "Purchase Guide",
        step1: {
          title: "Choose Package",
          desc: "Select the right membership package above and click \"Join Now\""
        },
        step2: {
          title: "Payment",
          desc: "VLINKPAY window will open. Complete secure payment"
        },
        step3: {
          title: "Receive Code",
          desc: "You will receive redeem code via email after successful payment"
        },
        step4: {
          title: "Activate",
          desc: "Enter code in the form beside to activate membership"
        },
        note: "Note:",
        note_desc: "One account can use multiple codes. Highest tier will be activated first."
      },
      tabs: {
        redeem: "Enter Code",
        check: "Check Status"
      },
      form: {
        title_redeem: "Enter Redeem Code",
        title_check: "Check Membership"
      },
      faq: {
        title: "Frequently Asked Questions",
        q1: "Does the redeem code expire?",
        a1: "Yes, the code is valid for 30 days from payment date.",
        q2: "Can I transfer the code to someone else?",
        a2: "Yes, the code is transferable. Whoever enters the correct code will receive the membership.",
        q3: "What if I have multiple membership packages?",
        a3: "The highest package will be activated first. When it expires, the lower package will automatically apply."
      }
    },
    payment_modal: {
      header: {
        membership: "Membership",
        payment: "Payment:"
      },
      email_form: {
        title: "Enter Your Email",
        subtitle: "Redeem code will be sent to this email after successful payment",
        label: "Email",
        placeholder: "example@email.com",
        required: "*",
        button: "Continue Payment",
        error_required: "Please enter email",
        error_invalid: "Invalid email"
      },
      notes: {
        title: "Important notes:",
        note1: "Email must be accurate to receive redeem code",
        note2: "Check spam folder if you don't see the email",
        note3: "Code is valid for 30 days"
      },
      payment_iframe: {
        sent_to: "Redeem code will be sent to:",
        loading: "Loading VLINKPAY payment page...",
        copy_url: "Copy Link",
        copied: "Copied!",
        open_in_new_tab: "Open in New Tab"
      },
      success: {
        title: "🎉 Payment successful!",
        code_label: "Redeem code:",
        instruction1: "Please check email to receive the code.",
        instruction2: "Use this code to activate membership below."
      }
    },
    promotions: {
      header: {
        badge: "Special Offers",
        title: "Current Promotions"
      },
      crypto_slide: {
        badge: "PAYMENT 4.0",
        title_line1: "PAY WITH",
        title_line2: "CRYPTO",
        description: "Get an instant",
        discount: "10% OFF",
        description_part2: "when you pay with Bitcoin, USDT or VLinkPay wallet.",
        button: "PAY NOW"
      },
      golden_hour_slide: {
        title: "GOLDEN HOUR",
        days: "MONDAY - THURSDAY",
        time: "12:00 PM - 3:30 PM",
        discount: "15% OFF",
        button: "BOOK APPOINTMENT"
      },
      vip_royalty_slide: {
        badge: "MEMBERS ONLY",
        title_vip: "VIP",
        title_royalty: "ROYALTY",
        description: "Join our exclusive club today. Receive",
        credit: "$50 CREDIT",
        description_part2: "instantly upon registration.",
        button: "JOIN CLUB"
      }
    }
  },
  
  vi: {
    nav: {
      home: "Trang Chủ",
      about_us: "Về Chúng Tôi",
      services: "Dịch Vụ",
      promotions: "Khuyến Mãi",
      egift: "QUÀ TẶNG ĐIỆN TỬ",
      membership: "Thành Viên",
      careers: "Tuyển Dụng",
      gallery: "Thư Viện",
      booking: "Đặt Lịch Ngay",
      staff: "Nhân Viên",
      locations: "Chi Nhánh",
      reviews: "Đánh Giá",
      contact: "Liên Hệ"
    },
    bottom_nav: {
      home: "Trang Chủ",
      services: "Dịch Vụ",
      booking: "Đặt Lịch",
      membership: "Thành Viên",
      egift: "Quà Tặng"
    },
    chatbot: {
      online: "Đang hoạt động",
      input_placeholder: "Hỏi về dịch vụ...",
      welcome: "Xin chào! Chào mừng đến với Bitcoin Nail Bar. 💅✨ Tôi có thể giúp bạn tìm liệu trình thư giãn hoàn hảo hoặc đặt lịch hẹn. Tôi có thể giúp gì cho bạn hôm nay?",
      error: "Hiện tại kết nối mạng đang gặp chút sự cố. Vui lòng thử lại sau giây lát!",
      bubbles: [
        "Xin chào! Tôi có thể giúp gì? 👋",
        "Bạn cần hỗ trợ đặt lịch? 💅",
        "Khám phá spa sang trọng! ✨",
        "Chúng tôi ở đây để hỗ trợ! 💬"
      ]
    },
    home: {
      badge: "SALON NAIL BITCOIN ĐẦU TIÊN TẠI MỸ",
      hero_unlock: "Mở Khóa",
      hero_vip_status: "Trạng Thái VIP",
      hero_get_rewards: "Nhận Thưởng",
      hero_desc_new_1: "Nâng tầm trải nghiệm làm đẹp với",
      hero_membership_program: "Chương Trình Thành Viên",
      hero_enjoy_up_to: "Tận hưởng tới",
      hero_cashback_20: "Hoàn Tiền 20%",
      hero_priority_access: "đặt lịch ưu tiên và quyền truy cập độc quyền.",
      cta_view_packages: "XEM GÓI DỊCH VỤ",
      cta_design_card: "THIẾT KẾ THẺ CỦA BẠN",
      card_valid_thru: "HẾT HẠN",
      card_10_off: "GIẢM 10%",
      card_vip_membership: "THÀNH VIÊN VIP",
      card_cashback: "HOÀN TIỀN",
      hero_title_1: "Vẻ Đẹp",
      hero_title_2: "Sang Trọng",
      hero_title_3: "Đột Phá",
      hero_desc_1: "Nơi nghệ thuật làm móng đỉnh cao gặp gỡ",
      hero_desc_1_bold: "Cộng đồng Crypto",
      hero_desc_2: "Trải nghiệm không gian",
      hero_desc_2_bold_1: "10,000 SQFT",
      hero_desc_2_part_2: "đầu tiên tại Mỹ chấp nhận",
      hero_desc_2_bold_2: "Thanh toán Crypto",
      cta_book: "ĐẶT LỊCH NGAY",
      cta_vip: "THAM GIA VIP CLUB",

      features_section: {
        crypto_payments: {
          title: "Thanh Toán Crypto",
          subtitle: "Chấp nhận Bitcoin, USDT, VLINKPAY.",
          description: "Nhanh chóng & Tuyệt đối an toàn."
        },
        bar_cocktails: {
          title: "Quầy Bar & Cocktail",
          subtitle: "Thưởng thức đồ uống miễn phí tại Bar sang trọng",
          description: "trong khi thư giãn."
        },
        medical_hygiene: {
          title: "Vệ Sinh Y Tế",
          subtitle: "Quy trình tiệt trùng Autoclave cấp bệnh viện",
          description: "An toàn là trên hết."
        },
        large_space: {
          title: "10,000+ SQF",
          subtitle: "Không gian lớn nhất tại Houston,",
          description: "được thiết kế cho sự riêng tư và đẳng cấp."
        }
      },
      
      bnb_section: {
        card_title: "Giao Lưu Crypto",
        card_desc: "Mỗi Chủ Nhật tại Lounge",
        card_btn: "Tham Gia",
        badge: "Tương Lai Của Vẻ Đẹp",
        title_1: "Bitcoin Nail Bar",
        title_2: "Đầu Tiên & Duy Nhất",
        desc: "Tại Bitcoin Nail Bar, chúng tôi không chỉ làm đẹp. Chúng tôi tạo ra một hệ sinh thái nơi nghệ thuật gặp gỡ công nghệ. Thanh toán dịch vụ bằng lợi nhuận đầu tư chưa bao giờ sành điệu đến thế.",
        feature_1_title: "Kiến Thức Crypto",
        feature_1_desc: "Giao lưu với chuyên gia, cập nhật xu hướng thị trường trong khi tận hưởng dịch vụ Spa Pedicure.",
        feature_2_title: "Thanh Toán 4.0",
        feature_2_desc: "Quét mã QR và thanh toán tức thì bằng Bitcoin, ETH, USDT hoặc ví VLinkPay. Không tiền mặt, không phiền toái.",
        btn_register: "ĐĂNG KÝ VLINKPAY"
      },
      
      about: {
        badge: "Về Chúng Tôi",
        title: "Bitcoin Nail Bar Sang Trọng Đầu Tiên Trên Thế Giới",
        desc_1: "Bitcoin Nail Bar™ là beauty lounge đầu tiên trên thế giới được xây dựng dưới thương hiệu Bitcoin—thiết lập tiêu chuẩn mới bằng cách kết hợp sự sang trọng, nghệ thuật và công nghệ blockchain.",
        desc_2: "Với diện tích hơn 10,000 SQFT, không gian của chúng tôi được thiết kế như một Trung Tâm Trải Nghiệm Làm Đẹp Cao Cấp, nơi khách hàng bước vào môi trường tương lai kết hợp thẩm mỹ tinh tế với sự tự do của thanh toán kỹ thuật số hiện đại.",
        desc_3: "Tại đây, vẻ đẹp gặp gỡ sự đổi mới. Khách hàng có thể tận hưởng dịch vụ làm móng cao cấp, spa, nối mi, massage và khu vực thư giãn trọn vẹn—tất cả được nâng tầm bởi thiết kế tương lai và tùy chọn thanh toán crypto liền mạch.",
        
        vision: {
          title: "TẦM NHÌN",
          desc: "Tái định nghĩa ngành công nghiệp làm đẹp toàn cầu bằng cách trở thành Nail Bar Công Nghệ Làm Đẹp hàng đầu thế giới, nơi:",
          items: [
            "Thẩm mỹ sang trọng gặp gỡ blockchain tiên tiến",
            "Crypto trở thành một phần tự nhiên của cuộc sống hàng ngày",
            "Khách hàng tận hưởng trải nghiệm dịch vụ thông minh, an toàn và hiện đại",
            "Sự đổi mới định hình cách các dịch vụ làm đẹp hoạt động trong tương lai"
          ]
        },
        mission: {
          title: "SỨ MỆNH",
          items: [
             { title: "Đưa Crypto Vào Làm Đẹp Hàng Ngày", desc: "Đầu tiên tại Mỹ chấp nhận BTC, ETH, USDT, VMM, USDV. Làm cho crypto trở nên thiết thực & dễ tiếp cận." },
             { title: "Trải Nghiệm Sang Trọng Quy Mô Lớn", desc: "Lounge 10,000 SQFT, nội thất phong cách nghỉ dưỡng và tiêu chuẩn vệ sinh hàng đầu." },
             { title: "Xây Dựng Cộng Đồng Tiên Phong", desc: "Kết nối những người tiên phong nắm bắt công nghệ và lối sống sang trọng hiện đại." },
             { title: "Trao Quyền Cho Chuyên Gia", desc: "Chế độ đãi ngộ xuất sắc, phát triển kỹ năng và môi trường nghề nghiệp tôn trọng." }
          ]
        }
      },
      
      hygiene: {
        badge: "An Toàn & Sức Khỏe",
        title: "Tiêu Chuẩn Vệ Sinh",
        desc: "Sức khỏe và sự an toàn của bạn là ưu tiên hàng đầu của chúng tôi. Chúng tôi duy trì các tiêu chuẩn vệ sinh và khử trùng cao nhất, vượt qua các quy định của ngành.",
        items: [
          "Khử trùng nồi hấp",
          "Dũa & buffer dùng một lần",
          "Khử trùng cấp y tế",
          "Bộ dụng cụ cá nhân",
          "Lọc không khí HEPA",
          "Khử trùng tia cực tím (UV)",
          "Lót dùng một lần",
          "Kỹ thuật viên được cấp phép"
        ]
      },
      
      services: {
        badge: "Dịch Vụ Cao Cấp",
        title: "Liệu Trình Đặc Trưng",
        desc: "Trải nghiệm sự hội tụ của sang trọng và công nghệ. Các liệu trình đặc trưng của chúng tôi kết hợp các yếu tố quý giá như vàng 24K và bụi kim cương, thanh toán trực tiếp bằng loại tiền điện tử ưa thích của bạn.",
        items: [
          "Pedicure Vàng Bitcoin",
          "Phòng VIP Riêng Tư",
          "Manicure Gel Kim Cương",
          "Sản Phẩm Xác Minh Blockchain",
          "Chăm Sóc Da Mặt Crypto Glow",
          "Thanh Toán Lightning Tức Thì",
          "Hồi Phục Mô Sâu",
          "Thành Viên NFT Độc Quyền"
        ],
        btn: "Khám Phá Menu"
      },
      promotions: {
        badge: "Ưu Đãi Có Hạn",
        title: "Khuyến Mãi Độc Quyền",
        card_1: {
          title: "GIẢM 20%",
          subtitle: "KHAI TRƯƠNG",
          desc: "Mừng khai trương giảm giá 20% tất cả các dịch vụ cho lần đầu tiên. Trải nghiệm sang trọng với giá ưu đãi.",
          btn: "Đặt Lịch Ngay"
        },
        card_2: {
          badge: "PHỔ BIẾN",
          title: "MIỄN PHÍ",
          subtitle: "COCKTAIL & ĐỒ UỐNG",
          desc: "Thưởng thức cocktail cao cấp, rượu sâm banh hoặc nước ngọt miễn phí với bất kỳ dịch vụ nào trên $50.",
          btn: "Xem Menu"
        },
        card_3: {
          title: "TẶNG $20",
          subtitle: "GIỚI THIỆU BẠN BÈ",
          desc: "Dẫn theo bạn bè và cả hai đều nhận được voucher $20 cho lần ghé thăm tiếp theo.",
          btn: "Tham Gia Club"
        }
      },
      vip_club: {
        badge: "CLB VIP Bitcoin",
        title_1: "Tham Gia CLB VIP &",
        title_2: "Nhận Ưu Đãi Độc Quyền",
        desc_part_1: "Trở thành thành viên của",
        desc_part_2: "để tận hưởng những đặc quyền dành riêng cho khách hàng thân thiết và người sở hữu crypto.",
        feature_1_title: "Hoàn Tiền 5%",
        feature_1_desc: "Nhận 5% giá trị hóa đơn vào tài khoản thành viên cho mỗi lần sử dụng dịch vụ.",
        feature_2_title: "Quà Sinh Nhật",
        feature_2_desc: "Miễn phí dịch vụ Spa Pedicure cao cấp trong tháng sinh nhật của bạn.",
        form: {
          title: "Tham Gia Elite Club",
          subtitle: "Mở khóa tương lai của dịch vụ làm đẹp",
          name_label: "Họ và Tên",
          name_placeholder: "Nhập họ tên của bạn",
          phone_label: "Số Điện Thoại",
          phone_placeholder: "Nhập số điện thoại",
          btn: "Đăng Ký Miễn Phí",
          footer: "Chúng tôi cam kết bảo mật thông tin tuyệt đối."
        }
      },

      membership: {
        badge: "PHONG CÁCH CỦA BẠN",
        title: "Gói Thành Viên Hàng Năm",
        most_popular: "PHỔ BIẾN NHẤT",
        save: "TIẾT KIỆM",
        entry_level: "CƠ BẢN",
        period: "/năm",
        valued_at: "TRỊ GIÁ",
        redeem_prompt: "Đã thanh toán? Kích hoạt membership ngay",
        plans: {
          silver: {
            name: "BẠC",
            subtitle: "CƠ BẢN",
            button: "THAM GIA GÓI BẠC",
            features: [
              "Quyền Lợi Giá Thành Viên",
              "Hoàn Tiền 10% Bitcoin",
              "Miễn Phí Tháo Gel",
              "Quà Sinh Nhật ($25)"
            ]
          },
          gold: {
            name: "VÀNG",
            subtitle: "VÀNG",
            button: "THAM GIA GÓI VÀNG",
            features: [
              "Tín Dụng Hàng Tháng $50",
              "Hoàn Tiền 10% Dịch Vụ",
              "Ưu Tiên Đặt Lịch",
              "Giảm Giá 25% Sinh Nhật"
            ]
          },
          platinum: {
            name: "BẠCH KIM",
            subtitle: "BẠCH KIM",
            button: "THAM GIA GÓI BẠCH KIM",
            features: [
              "Tín Dụng Hàng Tháng $60",
              "Hoàn Tiền 15% Dịch Vụ",
              "Truy Cập Phòng Chờ VIP",
              "Bao Gồm Đồ Uống Cao Cấp"
            ]
          },
          vip_crypto: {
            name: "VIP CRYPTO",
            subtitle: "VIP CRYPTO",
            button: "THAM GIA GÓI VIP",
            features: [
              "Tín Dụng Hàng Tháng $80",
              "Hoàn Tiền 20% (Tốt Nhất)",
              "Tất Cả Đặc Quyền",
              "Thưởng Thanh Toán Crypto"
            ]
          }
        }
      },
      
      why_exists: {
        title: "TẠI SAO BITCOIN NAIL BAR™ TỒN TẠI",
        subtitle_1: "Ngành làm đẹp đang phát triển.",
        subtitle_2: "Khách hàng đang phát triển.",
        subtitle_3: "Công nghệ đang phát triển.",
        lead: "Bitcoin Nail Bar™ được tạo ra để đặt ra một chuẩn mực mới:",
        feature_1: "Một salon làm móng sang trọng với quy mô hiếm gặp",
        feature_2: "Một thương hiệu tương lai được thúc đẩy bởi văn hóa blockchain",
        feature_3_title: "Chấp Nhận Thanh Toán Crypto",
        feature_3_desc: "Thanh toán nhanh chóng, an toàn với Bitcoin & các loại tiền điện tử chính. Không có rào cản.",
        feature_4: "Salon làm móng đầu tiên tự hào mang tên Bitcoin",
        feature_5: "Một không gian 10.000 SQFT định nghĩa lại điều gì là một salon làm móng",
        cta_line_1: "Chúng tôi không chỉ mở một salon làm móng.",
        cta_line_2: "Chúng tôi đang xây dựng một biểu tượng."
      },
      
      main_services: {
        title: "Dịch Vụ Chính",
        subtitle: "Khám phá loạt dịch vụ chăm sóc móng cao cấp toàn diện của chúng tôi",
        classic_manicure: "Manicure Cổ Điển",
        gel_manicure: "Manicure Gel",
        spa_pedicure: "Pedicure Spa",
        nail_art: "Nghệ Thuật Móng",
        acrylic_nails: "Móng Bột",
        nail_extensions: "Móng Dài",
        view_all: "Xem Tất Cả Dịch Vụ"
      }
    },
    coming_soon: {
      status: "Đang Thực Hiện",
      title_1: "Điều Phi Thường",
      title_2: "Đang Đến",
      desc: "Chúng tôi đang tạo ra một trải nghiệm mang tính cách mạng cho hệ th��ng địa điểm và đánh giá. Tương lai của công nghệ làm đẹp sang trọng đáng để chờ đợi.",
      return_home: "Về Trang Chủ",
      book_now: "Đặt Lịch Ngay"
    },
    booking_page: {
      subtitle: "Chọn dịch vụ và thời gian ưa thích. Chúng tôi sẽ lo phần còn lại!",
      back: "Quay Lại",
      steps: {
        services: "Chọn Dịch Vụ",
        services_desc: "Chọn một hoặc nhiều dịch vụ bạn muốn đặt",
        time: "Chọn Ngày & Giờ",
        time_desc: "Chọn thời gian hẹn ưa thích của bạn",
        technician: "Chọn Kỹ Thuật Viên",
        details: "Thông Tin Của Bạn",
        details_desc: "Vui lòng cung cấp thông tin liên hệ của bạn",
        confirm: "Xác Nhận"
      },
      technician: {
        desc: "Chọn chuyên gia ưa thích của bạn",
        no_preference: "Không Ưu Tiên",
        no_preference_desc: "Chúng tôi sẽ chỉ định kỹ thuật viên cao cấp tiếp theo"
      },
      form: {
        name: "Họ Và Tên",
        phone: "Số Điện Thoại",
        email: "Địa Chỉ Email",
        optional: "(Tùy chọn)",
        request: "Yêu Cầu Đặc Biệt (Tùy chọn)",
        notes: "Ghi chú",
        notes_placeholder: "Bất kỳ yêu cầu đặc biệt hoặc ghi chú nào...",
        confirm: "Xác Nhận Đặt Lịch",
        confirm_book: "Xác Nhận Đặt Lịch",
        continue: "Tiếp Tục"
      },
      services: {
        loading: "Đang tải dịch vụ...",
        all: "Tất Cả Dịch Vụ",
        select_continue: "Chọn Dịch Vụ Để Tiếp Tục",
        no_category: "Không tìm thấy dịch vụ nào trong danh mục này.",
        total_estimated: "Tổng Ước Tính:"
      },
      time: {
        select_date: "Chọn Ngày",
        select_time: "Chọn Giờ",
        no_slots: "Không có khung giờ khả dụng cho hôm nay.",
        choose_another_day: "Vui lòng chọn ngày khác."
      },
      summary: {
        title: "Tóm Tắt Đặt Lịch",
        services: "Dịch Vụ:",
        date: "Ngày:",
        time: "Giờ:",
        technician: "Kỹ Thuật Viên:",
        total: "Tổng Cộng:"
      },
      processing: "Đang xử lý...",
      errors: {
        required_fields: "Vui lòng điền đầy đủ các trường bắt buộc",
        booking_failed: "Đặt lịch thất bại. Vui lòng thử lại.",
        general: "Đã xảy ra lỗi. Vui lòng thử lại."
      },
      success: "Đặt Lịch Thành Công!"
    },
    service_translations: {
      classic_manicure: {
        name: "Manicure Cổ Điển",
        description: "Chăm sóc móng tay cơ bản với tạo hình và sơn"
      },
      gel_manicure: {
        name: "Manicure Gel",
        description: "Sơn gel bền lâu, không bong tróc"
      },
      spa_pedicure: {
        name: "Pedicure Spa",
        description: "Trải nghiệm chăm sóc chân cao cấp"
      },
      nail_art_design: {
        name: "Nghệ Thuật Móng",
        description: "Thiết kế nghệ thuật độc đáo"
      },
      acrylic_nails: {
        name: "Móng Bột",
        description: "Nối móng bột bền chắc"
      },
      nail_extensions: {
        name: "Móng Dài",
        description: "Nối móng đẹp với độ dài hoàn hảo"
      },
      duration_unit: "phút"
    },
    services_page: {
      hero_title: "Dịch Vụ",
      hero_title_highlight: "Đẳng Cấp Thế Giới",
      hero_desc: "Trải nghiệm đỉnh cao của sự sang trọng với các liệu trình lấy cảm hứng từ Bitcoin của chúng tôi.",
      art_title: "Nghệ Thuật Của",
      art_highlight: "Chăm Sóc Móng Hiện Đại",
      art_desc: "Tại Bitcoin Nail Bar, mỗi dịch vụ là một trải nghiệm. Chúng tôi kết hợp kỹ thuật truyền thống với công nghệ hiện đại để đảm bảo độ chính xác, vệ sinh và vẻ đẹp bền lâu.",
      premium_materials: "Vật Liệu Cao Cấp",
      premium_desc: "Chúng tôi chỉ sử dụng các loại sơn hữu cơ, không độc hại.",
      menu_title: "Menu Của Chúng Tôi",
      service_menu: {
        title: "Menu Dịch Vụ",
        subtitle: "Chăm Sóc Toàn Diện",
        headers: {
          service: "Dịch Vụ",
          regular: "Thường",
          member: "Hội Viên"
        },
        categories: {
          acrylic: "Dịch Vụ Móng Bột",
          dipping: "Nhúng Bột",
          gel: "Dịch Vụ Sơn Gel",
          waxing: "Tẩy Lông",
          pedicure: "Chăm Sóc Chân",
          manicure: "Chăm Sóc Tay",
          kids: "Dịch Vụ Trẻ Em",
          additional: "Dịch Vụ Thêm"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "BỘ ĐẦY ĐỦ",
                items: [
                  { name: "Móng bột với sơn thường", regular: 45, member: 35 },
                  { name: "Đầu trắng hoặc đầu ngọc trai", regular: 45, member: 35 },
                  { name: "Bột hồng đơn sắc", regular: 45, member: 35 },
                  { name: "Bột màu solid", regular: 45, member: 35 },
                  { name: "Móng bột với shellac", regular: 50, member: 40 },
                  { name: "Hồng & trắng", regular: 55, member: 45 },
                  { name: "Ombre 2 màu", regular: 55, member: 45 },
                  { name: "Ombre 3 màu", regular: 60, member: 50 }
                ]
              },
              {
                name: "BỔ SUNG MÓNG BỘT",
                items: [
                  { name: "Bổ sung cùng màu", regular: 35, member: 30 },
                  { name: "Đổi màu", regular: 40, member: 33 },
                  { name: "Bổ sung móng bột kèm shellac", regular: 45, member: 35 },
                  { name: "Bổ sung hồng & trắng", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "BỘT NHÚNG",
                items: [
                  { name: "Phủ nhúng", regular: 45, member: 40 },
                  { name: "Bộ đầy đủ nhúng", regular: 50, member: 45 },
                  { name: "Nhúng hồng & trắng", regular: 55, member: 50 },
                  { name: "Nhúng ombre", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "DỊCH VỤ GEL",
                items: [
                  { name: "Manicure gel", regular: 40, member: 35 },
                  { name: "Pedicure gel", regular: 50, member: 45 },
                  { name: "Đổi sơn gel (Tay)", regular: 25, member: 20 },
                  { name: "Đổi sơn gel (Chân)", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "MẶT",
                items: [
                  { name: "Lông mày", regular: 15, member: 12 },
                  { name: "Môi", regular: 10, member: 8 },
                  { name: "Cằm", regular: 12, member: 10 },
                  { name: "Toàn bộ mặt", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "LIỆU TRÌNH CHĂM SÓC CHÂN",
                items: [
                  { name: "Pedicure cổ điển", regular: 35, member: 30 },
                  { name: "Pedicure cao cấp", regular: 50, member: 45 },
                  { name: "Pedicure đặc trưng Bitcoin", regular: 75, member: 65 },
                  { name: "Pedicure Spa núi lửa", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "LIỆU TRÌNH CHĂM SÓC TAY",
                items: [
                  { name: "Manicure cổ điển", regular: 25, member: 20 },
                  { name: "Manicure cao cấp", regular: 35, member: 30 },
                  { name: "Manicure đặc trưng Bitcoin", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "CHO TRẺ EM (Dưới 10 tuổi)",
                items: [
                  { name: "Manicure", regular: 15, member: 12 },
                  { name: "Pedicure", regular: 25, member: 22 },
                  { name: "Đổi sơn (Tay)", regular: 10, member: 8 },
                  { name: "Đổi sơn (Chân)", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "DỊCH VỤ BỔ SUNG",
                items: [
                  { name: "Sửa móng", regular: 5, member: 0 },
                  { name: "Tháo móng", regular: 15, member: 10 },
                  { name: "Sáp paraffin", regular: 10, member: 8 },
                  { name: "Loại bỏ vết chai", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "Đặt Danh Mục Này",
      find_location: "Tìm Chi Nhánh Gần Nhất",
      book_appointment: "Đặt Lịch Hẹn Ngay",
      ready_title: "Sẵn Sàng Trải Nghiệm Tương Lai?",
      ready_desc: "Tham gia cùng hàng ngàn khách hàng đã chuyển sang tiêu chuẩn Bitcoin Nail Bar.",
      categories: {
        signature: {
          title: "Liệu Trình Đặc Trưng",
          desc: "Trải nghiệm đỉnh cao của sự sang trọng với các liệu trình lấy cảm hứng từ Bitcoin của chúng tôi.",
          items: [
            { name: "Pedicure Vàng Bitcoin", price: "$150", desc: "Ngâm chân vàng 24K, tinh chất CBD, massage mô sâu." },
            { name: "Manicure Gel Kim Cương", price: "$85", desc: "Tẩy tế bào chết bằng bụi kim cương thật với lớp hoàn thiện gel cao cấp." },
            { name: "Chăm Sóc Da Mặt Crypto Glow", price: "$120", desc: "Liệu pháp LED kết hợp với peel enzyme hữu cơ." }
          ]
        },
        comprehensive: {
          title: "Chăm Sóc Toàn Diện",
          desc: "Chăm sóc thiết yếu được nâng lên tiêu chuẩn sang trọng.",
          items: [
            { name: "Manicure Cổ Điển", price: "$45", desc: "Chăm sóc da quanh móng, massage và sơn thường." },
            { name: "Thay Sơn Gel", price: "$35", desc: "Tháo và sơn màu gel cao cấp." },
            { name: "Đắp Bột Full Set", price: "$75+", desc: "Đắp bột tạo hình chính xác." },
            { name: "Vẽ Móng Nghệ Thuật", price: "$15+", desc: "Thiết kế tùy chỉnh, đá quý và trang trí móng nghệ thuật." }
          ]
        }
      },
      no_services: "Chưa có dịch vụ"
    },
    footer: {
      desc: "Dịch vụ ch��m sóc móng cao cấp mang phong cách tương lai. Salon sang trọng tích hợp crypto đầu tiên trên thế giới.",
      accept: "Chấp Nhận Thanh Toán",
      quick_links: "Liên Kết Nhanh",
      popular_services: "Dịch Vụ Phổ Biến",
      contact: "Liên Hệ",
      rights: "Đã đăng ký bản quyền."
    },
    careers: {
      badge: "TUYỂN DỤNG & CƠ HỘI",
      title: "Gia Nhập Đội Ngũ Tinh Hoa",
      desc: "Bạn có phải là kỹ thuật viên làm móng tài năng hoặc chuyên gia làm đẹp đang tìm kiếm một môi trường danh tiếng để thể hiện kỹ năng của mình? Bitcoin Nail Bar cung cấp gói đãi ngộ cạnh tranh nhất trong ngành.",
      features: [
        "Hoa hồng cao + 100% Tiền Tip",
        "Môi trường làm việc hiện đại, công nghệ cao (10,000 SQFT)",
        "Đào tạo liên tục & phát triển kỹ năng",
        "Ca làm việc linh hoạt & quản lý hỗ trợ"
      ],
      cta: "ỨNG TUYỂN NGAY HÔM NAY",
      salary_badge_title: "Lương Cao Nhất",
      salary_badge_subtitle: "TẠI KHU VỰC HOUSTON"
    },
    ready_cta: {
      instagram: "THEO DÕI CHÚNG TÔI TRÊN INSTAGRAM",
      title: "Sẵn Sàng Thay Đổi Diện Mạo?",
      desc: "Đặt lịch hẹn ngay hôm nay và trải nghiệm đỉnh cao của việc chăm sóc móng sang trọng. Hành trình đến với bộ móng đẹp và khỏe mạnh bắt đầu tại đây.",
      btn_book: "Đặt Lịch Ngay",
      btn_explore: "Khám Phá Dịch Vụ"
    },
    egift: {
      badge: "MÓN QUÀ HOÀN HẢO",
      desc: "Mang đến bất ngờ cho người thân yêu với chìa khóa thư giãn kỹ thuật số. Giao ngay lập tức qua Email/SMS.",
      send: "Gửi",
      luxury: "SANG TRỌNG",
      instantly: "Ngay lập tức",
      ai_messages: [
        "Chúc bạn một ngày thư giãn tràn ngập niềm vui và được chăm sóc!",
        "Hãy tự thưởng cho mình sự sang trọng mà bạn xứng đáng. Tận hưởng nhé!",
        "Một chút gì đó để làm bừng sáng ngày của bạn. Những lời chúc tốt đẹp nhất!",
        "Thư giãn, làm mới và nạp lại năng lượng. Bạn đã làm việc vất vả rồi!",
        "Gửi đến bạn tình yêu và khoảnh khắc hạnh phúc thuần khiết."
      ]
    },
    redeem: {
      badge: "Redeem Your Code",
      title: "Kích Hoạt Membership",
      subtitle: "Đã thanh toán thành công? Nhập mã redeem từ email để kích hoạt gói membership của bạn",
      instructions: {
        title: "Hướng Dẫn Mua Gói",
        step1: {
          title: "Chọn Gói",
          desc: "Chọn gói membership phù hợp ở bên trên và nhấn \"Join Now\""
        },
        step2: {
          title: "Thanh Toán",
          desc: "Cửa sổ VLINKPAY sẽ mở. Hoàn tất thanh toán an toàn"
        },
        step3: {
          title: "Nhận Mã",
          desc: "Bạn sẽ nhận mã redeem qua email sau khi thanh toán thành công"
        },
        step4: {
          title: "Kích Hoạt",
          desc: "Nhập mã vào form bên cạnh để kích hoạt membership"
        },
        note: "Lưu ý:",
        note_desc: "Một tài khoản có thể sử dụng nhiều mã. Gói cao nhất sẽ được ưu tiên kích hoạt trước."
      },
      tabs: {
        redeem: "Nhập Mã",
        check: "Kiểm tra"
      },
      form: {
        title_redeem: "Nhập Mã Redeem",
        title_check: "Kiểm Tra Membership"
      },
      faq: {
        title: "Câu Hỏi Thường Gặp",
        q1: "Mã redeem có thời hạn không?",
        a1: "Có, mã có hiệu lực trong 30 ngày kể từ khi thanh toán.",
        q2: "Tôi có thể chuyển mã cho người khác không?",
        a2: "Có, mã có thể chuyển nhượng. Ai nhập đúng mã sẽ nhận được membership.",
        q3: "Nếu tôi có nhiều gói membership thì sao?",
        a3: "Gói cao nhất sẽ được kích hoạt trước. Khi hết hạn, gói thấp hơn sẽ tự động được áp dụng."
      }
    },
    payment_modal: {
      header: {
        membership: "Membership",
        payment: "Thanh toán:"
      },
      email_form: {
        title: "Nhập Email Của Bạn",
        subtitle: "Mã redeem sẽ được gửi về email này sau khi thanh toán thành công",
        label: "Email",
        placeholder: "example@email.com",
        required: "*",
        button: "Tiếp Tục Thanh Toán",
        error_required: "Vui lòng nhập email",
        error_invalid: "Email không hợp lệ"
      },
      notes: {
        title: "Lưu ý quan trọng:",
        note1: "Email phải chính xác để nhận mã redeem",
        note2: "Kiểm tra cả hộp thư spam nếu không thấy email",
        note3: "Mã có hiệu lực trong 30 ngày"
      },
      payment_iframe: {
        sent_to: "Mã redeem sẽ được gửi về:",
        loading: "Đang tải trang thanh toán VLINKPAY...",
        copy_url: "Sao Chép Link",
        copied: "Đã Sao Chép!",
        open_in_new_tab: "Mở Tab Mới"
      },
      success: {
        title: "🎉 Thanh toán thành công!",
        code_label: "Mã redeem:",
        instruction1: "Vui lòng kiểm tra email để nhận mã code.",
        instruction2: "Sử dụng mã này để kích hoạt membership bên dưới."
      }
    },
    promotions: {
      header: {
        badge: "Ưu Đãi Đặc Biệt",
        title: "Chương Trình Khuyến Mãi"
      },
      crypto_slide: {
        badge: "THANH TOÁN 4.0",
        title_line1: "THANH TOÁN",
        title_line2: "CRYPTO",
        description: "Giảm ngay",
        discount: "10%",
        description_part2: "khi thanh toán bằng Bitcoin, USDT hoặc ví VLinkPay.",
        button: "THANH TOÁN NGAY"
      },
      golden_hour_slide: {
        title: "GIỜ VÀNG",
        days: "THỨ HAI - THỨ NĂM",
        time: "12:00 CH - 3:30 CH",
        discount: "GIẢM 15%",
        button: "ĐẶT LỊCH HẸN"
      },
      vip_royalty_slide: {
        badge: "DÀNH CHO THÀNH VIÊN",
        title_vip: "VIP",
        title_royalty: "ROYALTY",
        description: "Tham gia câu lạc bộ độc quyền của chúng tôi. Nhận",
        credit: "$50 TIỀN ƯU ĐÃI",
        description_part2: "ngay khi đăng ký.",
        button: "THAM GIA NGAY"
      }
    }
  },

  es: {
    nav: {
      home: "Inicio",
      about_us: "Sobre Nosotros",
      services: "Servicios",
      promotions: "Promociones",
      egift: "REGALO ELECTRÓNICO",
      membership: "Membresía",
      careers: "Carreras",
      gallery: "Galería",
      booking: "Reservar Cita",
      staff: "Personal",
      locations: "Ubicaciones",
      reviews: "Reseñas",
      contact: "Contacto"
    },
    bottom_nav: {
      home: "Inicio",
      services: "Servicios",
      booking: "Reservar",
      membership: "Membresía",
      egift: "E-Regalo"
    },
    chatbot: {
      online: "En línea",
      input_placeholder: "Preguntar sobre servicios...",
      welcome: "¡Hola! Bienvenido a Bitcoin Nail Bar. 💅✨ Puedo ayudarte a encontrar el tratamiento de lujo perfecto o reservar tu cita. ¿Qué puedo hacer por ti hoy?",
      error: "Tengo un poco de problemas para conectarme a la red en este momento. ¡Por favor intenta de nuevo en un momento!",
      bubbles: [
        "¡Hola! ¿Te ayudo? 👋",
        "¿Necesitas ayuda para reservar? 💅",
        "¡Descubre nuestro spa de lujo! ✨",
        "¡Estamos aquí para ayudarte! 💬"
      ]
    },
    home: {
      badge: "EL PRIMER SALÓN DE UÑAS BITCOIN EN EE.UU.",
      hero_unlock: "Desbloquear",
      hero_vip_status: "Estatus VIP",
      hero_get_rewards: "Obtener Recompensas",
      hero_desc_new_1: "Eleva tu experiencia de belleza con nuestro",
      hero_membership_program: "Programa de Membresía",
      hero_enjoy_up_to: "Disfruta de hasta",
      hero_cashback_20: "20% Cashback",
      hero_priority_access: "reserva prioritaria y acceso exclusivo.",
      cta_view_packages: "VER PAQUETES",
      cta_design_card: "DISEÑA TU TARJETA",
      card_valid_thru: "VÁLIDO HASTA",
      card_10_off: "10% DCTO",
      card_vip_membership: "MEMBRESÍA VIP",
      card_cashback: "CASHBACK",
      hero_title_1: "Lujo",
      hero_title_2: "Belleza",
      hero_title_3: "Innovación",
      hero_desc_1: "Donde el arte de uñas de alta gama se encuentra con la",
      hero_desc_1_bold: "comunidad Crypto",
      hero_desc_2: "Experimenta el primer espacio de",
      hero_desc_2_bold_1: "10,000 SQFT",
      hero_desc_2_part_2: "en EE.UU. que acepta",
      hero_desc_2_bold_2: "pagos Crypto",
      cta_book: "RESERVAR CITA",
      cta_vip: "UNIRSE AL CLUB VIP",

      features_section: {
        crypto_payments: {
          title: "Pagos con Cripto",
          subtitle: "Aceptando Bitcoin, USDT, VLINKPAY.",
          description: "Rápido y Absolutamente Seguro."
        },
        bar_cocktails: {
          title: "Bar y Cócteles",
          subtitle: "Disfruta bebidas gratis en nuestro Bar de lujo",
          description: "mientras te relajas."
        },
        medical_hygiene: {
          title: "Higiene Médica",
          subtitle: "Esterilización en Autoclave de grado hospitalario",
          description: "proceso. La seguridad primero."
        },
        large_space: {
          title: "10,000+ SQF",
          subtitle: "El espacio más grande en Houston,",
          description: "diseñado para privacidad y clase."
        }
      },
      
      bnb_section: {
        card_title: "Networking Crypto",
        card_desc: "Todos los domingos en el Lounge",
        card_btn: "Únete",
        badge: "Futuro de la Belleza",
        title_1: "Bitcoin Nail Bar",
        title_2: "Primero y Único",
        desc: "En Bitcoin Nail Bar, no solo hacemos belleza. Creamos un ecosistema donde el arte se encuentra con la tecnología. Pagar servicios con tus ganancias de inversión nunca ha sido tan elegante.",
        feature_1_title: "Conocimiento Crypto",
        feature_1_desc: "Conéctate con expertos, actualiza tendencias del mercado mientras disfrutas de servicios de Spa Pedicure.",
        feature_2_title: "Pago 4.0",
        feature_2_desc: "Escanea el código QR y paga al instante con Bitcoin, ETH, USDT o billetera VLinkPay. Sin efectivo, sin molestias.",
        btn_register: "REGISTRAR VLINKPAY"
      },
      
      about: {
        badge: "Sobre Nosotros",
        title: "El Primer Nail Bar de Lujo Marca Bitcoin del Mundo",
        desc_1: "Bitcoin Nail Bar™ es el primer salón de belleza del mundo construido bajo la marca Bitcoin—estableciendo un nuevo estándar al fusionar lujo, arte y tecnología blockchain.",
        desc_2: "Con más de 10,000 SQFT, nuestro espacio está diseñado como un Centro de Experiencia de Belleza de Alta Gama, donde los clientes entran en un entorno futurista que combina estética elegante con la libertad de los pagos digitales modernos.",
        desc_3: "Aquí, la belleza se encuentra con la innovación. Los clientes pueden disfrutar de cuidado de uñas premium, servicios de spa, pestañas, masajes y un salón de relajación completo—todo elevado por un diseño futurista y opciones de pago crypto sin problemas.",
        
        vision: {
          title: "NUESTRA VISIÓN",
          desc: "Redefinir la industria de belleza global convirtiéndonos en el líder mundial en Beauty-Tech Nail Bar, donde:",
          items: [
            "La estética de lujo se encuentra con blockchain de vanguardia",
            "Crypto se convierte en una parte natural de la vida cotidiana",
            "Los clientes disfrutan de una experiencia de servicio inteligente, segura y moderna",
            "La innovación da forma a cómo operan los servicios de belleza en el futuro"
          ]
        },
        mission: {
          title: "NUESTRA MISIÓN",
          items: [
             { title: "Llevar Crypto a la Belleza Diaria", desc: "Primero en EE.UU. en aceptar BTC, ETH, USDT, VMM, USDV. Haciendo crypto práctico y accesible." },
             { title: "Experiencia de Lujo a Escala", desc: "Salón de 10,000 SQFT, interiores estilo resort y estándares de higiene de primer nivel." },
             { title: "Construir Comunidad Visionaria", desc: "Conectando pioneros que abrazan la tecnología y el estilo de vida de lujo moderno." },
             { title: "Empoderar Profesionales", desc: "Excelente compensación, desarrollo de habilidades y un entorno profesional respetuoso." }
          ]
        }
      },
      
      hygiene: {
        badge: "Salud y Seguridad Primero",
        title: "Barra de Uñas Higiénica",
        desc: "Tu salud y seguridad son nuestras principales prioridades. Mantenemos los más altos estándares de higiene y saneamiento, superando las regulaciones de la industria.",
        items: [
          "Esterilización en autoclave",
          "Limas y pulidores de un solo uso",
          "Desinfección de grado médico",
          "Kits de herramientas individuales",
          "Filtración de aire HEPA",
          "Desinfección UV",
          "Revestimientos desechables",
          "Técnicos con licencia"
        ]
      },
      
      services: {
        badge: "Servicios Premium",
        title: "Tratamientos Exclusivos",
        desc: "Experimenta la convergencia de lujo y tecnología. Nuestros tratamientos exclusivos incorporan elementos preciosos como oro de 24K y polvo de diamante, pagaderos directamente con tu criptomoneda preferida.",
        items: [
          "Pedicura Bitcoin Gold",
          "Suites VIP Privadas",
          "Manicura Gel Diamante",
          "Productos Verificados por Blockchain",
          "Facial Crypto Glow",
          "Pagos Lightning Instantáneos",
          "Recuperación de Tejido Profundo",
          "Membresía NFT Exclusiva"
        ],
        btn: "Explorar Menú"
      },
      promotions: {
        badge: "Ofertas por Tiempo Limitado",
        title: "Promociones Exclusivas",
        card_1: {
          title: "20% OFF",
          subtitle: "GRAN APERTURA",
          desc: "Celebra nuestro lanzamiento con un 20% de descuento en todos los servicios para tu primera visita. Experimenta el lujo por menos.",
          btn: "Reservar Ahora"
        },
        card_2: {
          badge: "POPULAR",
          title: "GRATIS",
          subtitle: "CÓCTELES Y BEBIDAS",
          desc: "Disfruta de cócteles premium, champán o refrescos de cortesía con cualquier servicio superior a $50.",
          btn: "Ver Menú"
        },
        card_3: {
          title: "REGALO $20",
          subtitle: "RECOMIENDA A UN AMIGO",
          desc: "Trae a un amigo y ambos recibirán un vale de $20 para su próxima visita. ¡Compartir es cuidar!",
          btn: "Unirse al Club"
        }
      },
      vip_club: {
        badge: "Club VIP Bitcoin",
        title_1: "Únete al Club VIP &",
        title_2: "Obtén Recompensas Exclusivas",
        desc_part_1: "Conviértete en miembro de",
        desc_part_2: "para disfrutar de privilegios exclusivos reservados para clientes leales y poseedores de cripto.",
        feature_1_title: "5% de Puntos de Reembolso",
        feature_1_desc: "Recibe el 5% del valor de la factura en tu cuenta de miembro por cada uso del servicio.",
        feature_2_title: "Regalos de Cumpleaños",
        feature_2_desc: "Servicio de Spa Pedicura premium gratuito durante tu mes de cumpleaños.",
        form: {
          title: "Únete al Elite Club",
          subtitle: "Desbloquea el futuro de los servicios de belleza",
          name_label: "Nombre Completo",
          name_placeholder: "Ingresa tu nombre completo",
          phone_label: "Número de Teléfono",
          phone_placeholder: "Ingresa tu número de teléfono",
          btn: "Registrarse Gratis",
          footer: "Nos comprometemos a la seguridad absoluta de la información."
        }
      },

      membership: {
        badge: "TU ESTILO",
        title: "Paquetes de Membresía Anual",
        most_popular: "MÁS POPULAR",
        save: "AHORRA",
        entry_level: "NIVEL DE ENTRADA",
        period: "/año",
        valued_at: "VALORADO EN",
        plans: {
          silver: {
            name: "PLATA",
            subtitle: "NIVEL DE ENTRADA",
            button: "UNIRSE A PLATA",
            features: [
              "Acceso a Precios de Miembro",
              "10% Cashback en Bitcoin",
              "Retiro de Gel Gratis",
              "Regalo de Cumpleaños ($25)"
            ]
          },
          gold: {
            name: "ORO",
            subtitle: "ORO",
            button: "UNIRSE A ORO",
            features: [
              "Crédito Mensual de $50",
              "10% Cashback en Servicios",
              "Reserva Prioritaria",
              "25% Descuento en Cumpleaños"
            ]
          },
          platinum: {
            name: "PLATINO",
            subtitle: "PLATINO",
            button: "UNIRSE A PLATINO",
            features: [
              "Crédito Mensual de $60",
              "15% Cashback en Servicios",
              "Acceso a Sala VIP",
              "Bebidas Premium Incluidas"
            ]
          },
          vip_crypto: {
            name: "VIP CRYPTO",
            subtitle: "VIP CRYPTO",
            button: "UNIRSE A VIP",
            features: [
              "Crédito Mensual de $80",
              "20% Cashback (Mejor Valor)",
              "Beneficios Todo Incluido",
              "Bono de Pago Crypto"
            ]
          }
        }
      },
      
      why_exists: {
        title: "¿POR QUÉ EXISTE BITCOIN NAIL BAR™?",
        subtitle_1: "La industria de la belleza está evolucionando.",
        subtitle_2: "Los consumidores están evolucionando.",
        subtitle_3: "La tecnología está evolucionando.",
        lead: "Bitcoin Nail Bar™ fue creado para establecer un nuevo estándar:",
        feature_1: "Un salón de uñas de lujo en una escala rara de ver",
        feature_2: "Una marca futurista impulsada por la cultura blockchain",
        feature_3_title: "Pagos con Criptomoneda Aceptados",
        feature_3_desc: "Pagos rápidos y seguros con Bitcoin & altcoins principales. Sin fricción.",
        feature_4: "El primer salón de uñas que lleva orgullosamente el nombre de Bitcoin",
        feature_5: "Un espacio de 10,000 SQFT que redefine lo que puede ser un salón de uñas",
        cta_line_1: "No solo estamos abriendo un salón de uñas.",
        cta_line_2: "Estamos construyendo un ícono."
      },
      
      main_services: {
        title: "Servicios Principales",
        subtitle: "Explora nuestro amplio rango de tratamientos de cuidado de uñas premium",
        classic_manicure: "Manicura Clásica",
        gel_manicure: "Manicura Gel",
        spa_pedicure: "Pedicura Spa",
        nail_art: "Arte de Uñas",
        acrylic_nails: "Uñas de Acrílico",
        nail_extensions: "Extensiones de Uñas",
        view_all: "Ver Todos los Servicios"
      }
    },
    coming_soon: {
      status: "En Progreso",
      title_1: "Algo Extraordinario",
      title_2: "Está Llegando",
      desc: "Estamos creando una experiencia revolucionaria para nuestro sistema de ubicaciones y reseñas. El futuro de la tecnología de belleza de lujo vale la pena esperar.",
      return_home: "Volver al Inicio",
      book_now: "Reservar Ahora"
    },
    booking_page: {
      subtitle: "Elija sus servicios y hora preferida. ¡Nosotros nos encargamos del resto!",
      back: "Atrás",
      steps: {
        services: "Seleccionar Servicios",
        services_desc: "Elija uno o más servicios que desee reservar",
        time: "Seleccionar Fecha y Hora",
        time_desc: "Elija su hora de cita preferida",
        technician: "Seleccionar Técnico",
        details: "Sus Detalles",
        details_desc: "Por favor proporcione sus datos de contacto",
        confirm: "Confirmación"
      },
      technician: {
        desc: "Elija su experto preferido",
        no_preference: "Sin Preferencia",
        no_preference_desc: "Asignaremos el próximo técnico senior disponible"
      },
      form: {
        name: "Nombre Completo",
        phone: "Número de Teléfono",
        email: "Correo Electrónico",
        optional: "(Opcional)",
        request: "Solicitudes Especiales (Opcional)",
        notes: "Notas",
        notes_placeholder: "Cualquier solicitud especial o nota...",
        confirm: "Confirmar Reserva",
        confirm_book: "Confirmar Reserva",
        continue: "Continuar"
      },
      services: {
        loading: "Cargando servicios...",
        all: "Todos los Servicios",
        select_continue: "Seleccione un Servicio para Continuar",
        no_category: "No se encontraron servicios en esta categoría.",
        total_estimated: "Total Estimado:"
      },
      time: {
        select_date: "Seleccionar Fecha",
        select_time: "Seleccionar Hora",
        no_slots: "No hay horarios disponibles para hoy.",
        choose_another_day: "Por favor, elija otro día."
      },
      summary: {
        title: "Resumen de Reserva",
        services: "Servicios:",
        date: "Fecha:",
        time: "Hora:",
        technician: "Técnico:",
        total: "Total:"
      },
      processing: "Procesando...",
      errors: {
        required_fields: "Por favor complete todos los campos requeridos",
        booking_failed: "Error al reservar cita. Por favor intente nuevamente.",
        general: "Ocurrió un error. Por favor intente nuevamente."
      },
      success: "¡Reserva Confirmada!"
    },
    service_translations: {
      classic_manicure: {
        name: "Manicura Clásica",
        description: "Forma, pulido, cuidado de cutículas y esmalte"
      },
      gel_manicure: {
        name: "Manicura Gel",
        description: "Esmalte de gel de larga duración"
      },
      spa_pedicure: {
        name: "Pedicura Spa",
        description: "Experiencia definitiva de cuidado de pies"
      },
      nail_art_design: {
        name: "Diseño de Arte de Uñas",
        description: "Diseños artísticos personalizados"
      },
      acrylic_nails: {
        name: "Uñas de Acrílico",
        description: "Extensiones de acrílico duraderas"
      },
      nail_extensions: {
        name: "Extensiones de Uñas",
        description: "Hermosa longitud y forma"
      },
      duration_unit: "min"
    },
    services_page: {
      hero_title: "Servicios de",
      hero_title_highlight: "Clase Mundial",
      hero_desc: "Experimenta la cúspide del lujo con nuestros tratamientos inspirados en Bitcoin.",
      art_title: "El Arte del",
      art_highlight: "Cuidado de Uñas Moderno",
      art_desc: "En Bitcoin Nail Bar, cada servicio es una experiencia. Combinamos técnicas tradicionales con tecnología moderna para garantizar precisión, higiene y belleza duradera.",
      premium_materials: "Materiales Premium",
      premium_desc: "Usamos solo esmaltes orgánicos y no tóxicos.",
      menu_title: "Nuestro Menú",
      service_menu: {
        title: "Menú de Servicios",
        subtitle: "Cuidado Integral",
        headers: {
          service: "Servicio",
          regular: "Regular",
          member: "Miembro"
        },
        categories: {
          acrylic: "Servicios de Uñas de Acrílico",
          dipping: "Polvo de Inmersión",
          gel: "Servicio de Gel Shellac",
          waxing: "Servicios de Depilación",
          pedicure: "Pedicura",
          manicure: "Manicura",
          kids: "Servicios para Niños",
          additional: "Servicios Adicionales"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "CONJUNTO COMPLETO",
                items: [
                  { name: "Acrílico con esmalte", regular: 45, member: 35 },
                  { name: "Punta blanca o perla", regular: 45, member: 35 },
                  { name: "Solo polvo rosa", regular: 45, member: 35 },
                  { name: "Polvo color sólido", regular: 45, member: 35 },
                  { name: "Acrílico con shellac", regular: 50, member: 40 },
                  { name: "Rosa y blanco", regular: 55, member: 45 },
                  { name: "Ombre 2 colores", regular: 55, member: 45 },
                  { name: "Ombre 3 colores", regular: 60, member: 50 }
                ]
              },
              {
                name: "RELLENO DE UÑAS DE ACRÍLICO",
                items: [
                  { name: "Relleno mismo color", regular: 35, member: 30 },
                  { name: "Cambiar color", regular: 40, member: 33 },
                  { name: "Relleno acrílico con shellac", regular: 45, member: 35 },
                  { name: "Relleno rosa y blanco", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "POLVO DE INMERSIÓN",
                items: [
                  { name: "Superposición de inmersión", regular: 45, member: 40 },
                  { name: "Conjunto completo de inmersión", regular: 50, member: 45 },
                  { name: "Inmersión rosa y blanco", regular: 55, member: 50 },
                  { name: "Inmersión ombre", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "SERVICIOS DE GEL",
                items: [
                  { name: "Manicura gel", regular: 40, member: 35 },
                  { name: "Pedicura gel", regular: 50, member: 45 },
                  { name: "Cambio de esmalte gel (Manos)", regular: 25, member: 20 },
                  { name: "Cambio de esmalte gel (Pies)", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "CARA",
                items: [
                  { name: "Cejas", regular: 15, member: 12 },
                  { name: "Labio", regular: 10, member: 8 },
                  { name: "Mentón", regular: 12, member: 10 },
                  { name: "Cara completa", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "TRATAMIENTOS DE PEDICURA",
                items: [
                  { name: "Pedicura clásica", regular: 35, member: 30 },
                  { name: "Pedicura de lujo", regular: 50, member: 45 },
                  { name: "Pedicura signature Bitcoin", regular: 75, member: 65 },
                  { name: "Pedicura Spa volcán", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "TRATAMIENTOS DE MANICURA",
                items: [
                  { name: "Manicura clásica", regular: 25, member: 20 },
                  { name: "Manicura de lujo", regular: 35, member: 30 },
                  { name: "Manicura signature Bitcoin", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "PARA NIÑOS (Menores de 10)",
                items: [
                  { name: "Manicura", regular: 15, member: 12 },
                  { name: "Pedicura", regular: 25, member: 22 },
                  { name: "Cambio de esmalte (Manos)", regular: 10, member: 8 },
                  { name: "Cambio de esmalte (Pies)", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "COMPLEMENTOS",
                items: [
                  { name: "Reparación de uña", regular: 5, member: 0 },
                  { name: "Remoción de uñas", regular: 15, member: 10 },
                  { name: "Cera de parafina", regular: 10, member: 8 },
                  { name: "Remoción de callos", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "Reservar Esta Categoría",
      find_location: "Encontrar Ubicación Más Cercana",
      book_appointment: "Reservar Su Cita",
      ready_title: "¿Listo para Experimentar el Futuro?",
      ready_desc: "Únase a los miles de clientes que han cambiado al estándar Bitcoin Nail Bar.",
      categories: {
        signature: {
          title: "Tratamientos Exclusivos",
          desc: "Experimenta la cúspide del lujo con nuestros tratamientos inspirados en Bitcoin.",
          items: [
            { name: "Pedicura Bitcoin Gold", price: "$150", desc: "Remojo de oro 24K, infusión de CBD, masaje de tejido profundo." },
            { name: "Manicura Gel Diamante", price: "$85", desc: "Exfoliación con polvo de diamante real y acabado premium en gel." },
            { name: "Facial Crypto Glow", price: "$120", desc: "Terapia LED combinada con peeling enzimático orgánico." }
          ]
        },
        comprehensive: {
          title: "Cuidado Integral",
          desc: "Cuidado esencial elevado a un estándar de lujo.",
          items: [
            { name: "Manicura Clásica", price: "$45", desc: "Cuidado de cutículas, masaje y esmalte regular." },
            { name: "Cambio de Esmalte Gel", price: "$35", desc: "Remoción y aplicación de color gel premium." },
            { name: "Juego Completo de Acrílico", price: "$75+", desc: "Extensiones esculpidas con modelado de precisión." },
            { name: "Arte de Uñas", price: "$15+", desc: "Diseños personalizados, gemas y decoraciones artísticas para uñas." }
          ]
        }
      }
    },
    footer: {
      desc: "Servicios de cuidado de uñas premium con un toque futurista. El primer salón de lujo integrado con criptomonedas del mundo.",
      accept: "Aceptamos",
      quick_links: "Enlaces Rápidos",
      popular_services: "Servicios Populares",
      contact: "Contáctenos",
      rights: "Todos los derechos reservados."
    },
    careers: {
      badge: "CARRERAS Y OPORTUNIDADES",
      title: "Únete al Equipo Élite",
      desc: "¿Eres un técnico de uñas talentoso o experto en belleza buscando un entorno prestigioso para mostrar tus habilidades? Bitcoin Nail Bar ofrece el paquete de compensación más competitivo de la industria.",
      features: [
        "Alta Comisión + 100% de Propinas",
        "Entorno de trabajo moderno y de alta tecnología (10,000 SQFT)",
        "Capacitación continua y desarrollo de habilidades",
        "Turnos flexibles y gestión de apoyo"
      ],
      cta: "APLICAR HOY",
      salary_badge_title: "Pago Más Alto",
      salary_badge_subtitle: "EN EL ÁREA DE HOUSTON"
    },
    ready_cta: {
      instagram: "SÍGUENOS EN INSTAGRAM",
      title: "¿Listo para Transformar Tu Apariencia?",
      desc: "Reserva tu cita hoy y experimenta la cúspide del cuidado de uñas de lujo. Tu viaje hacia uñas hermosas y saludables comienza aquí.",
      btn_book: "Reservar Cita Ahora",
      btn_explore: "Explorar Servicios"
    },
    egift: {
      badge: "EL REGALO PERFECTO",
      desc: "Sorprende a tus seres queridos con una llave digital para la relajación. Entregado al instante vía Email/SMS.",
      send: "Enviar",
      luxury: "LUJO",
      instantly: "Al Instante",
      ai_messages: [
        "¡Deseándote un día relajante lleno de mimos y alegría!",
        "Date el gusto del lujo que te mereces. ¡Disfruta!",
        "Un pequeño detalle para alegrar tu día. ¡Los mejores deseos!",
        "Relájate, refréscate y recárgate. ¡Te lo has ganado!",
        "Enviándote amor y un momento de pura felicidad."
      ]
    }
  },

  fr: {
    nav: {
      home: "Accueil",
      about_us: "À Propos",
      services: "Services",
      promotions: "Promotions",
      egift: "CARTE CADEAU",
      membership: "Adhésion",
      careers: "Carrières",
      gallery: "Galerie",
      booking: "Prendre RDV",
      staff: "Équipe",
      locations: "Lieux",
      reviews: "Avis",
      contact: "Contact"
    },
    bottom_nav: {
      home: "Accueil",
      services: "Services",
      booking: "Réserver",
      membership: "Adhésion",
      egift: "E-Cadeau"
    },
    chatbot: {
      online: "En ligne",
      input_placeholder: "Demander des services...",
      welcome: "Bonjour ! Bienvenue au Bitcoin Nail Bar. 💅✨ Je peux vous aider à trouver le soin de luxe parfait ou à réserver votre rendez-vous. Que puis-je faire pour vous aujourd'hui ?",
      error: "J'ai un peu de mal à me connecter au réseau pour le moment. Veuillez réessayer dans un instant !",
      bubbles: [
        "Bonjour ! Puis-je aider ? 👋",
        "Besoin d'aide pour réserver ? 💅",
        "Découvrez notre spa de luxe ! ✨",
        "Nous sommes là pour vous aider ! 💬"
      ]
    },
    home: {
      badge: "LE PREMIER SALON DE MANUCURE BITCOIN AUX ÉTATS-UNIS",
      hero_unlock: "Débloquer",
      hero_vip_status: "Statut VIP",
      hero_get_rewards: "Obtenir des Récompenses",
      hero_desc_new_1: "Élevez votre expérience beauté avec notre",
      hero_membership_program: "Programme d'Adhésion",
      hero_enjoy_up_to: "Profitez de jusqu'à",
      hero_cashback_20: "20% Cashback",
      hero_priority_access: "réservation prioritaire et accès exclusif.",
      cta_view_packages: "VOIR FORFAITS",
      cta_design_card: "CONCEVOIR VOTRE CARTE",
      card_valid_thru: "VALABLE JUSQU'AU",
      card_10_off: "10% RÉDUC",
      card_vip_membership: "ADHÉSION VIP",
      card_cashback: "CASHBACK",
      hero_title_1: "Luxe",
      hero_title_2: "Beauté",
      hero_title_3: "Innovation",
      hero_desc_1: "Où l'art de l'onglerie haut de gamme rencontre la",
      hero_desc_1_bold: "communauté Crypto",
      hero_desc_2: "Découvrez le premier espace de",
      hero_desc_2_bold_1: "10 000 SQFT",
      hero_desc_2_part_2: "aux États-Unis à accepter",
      hero_desc_2_bold_2: "les paiements Crypto",
      cta_book: "PRENDRE RENDEZ-VOUS",
      cta_vip: "REJOINDRE LE CLUB VIP",

      features_section: {
        crypto_payments: {
          title: "Paiements Crypto",
          subtitle: "Acceptant Bitcoin, USDT, VLINKPAY.",
          description: "Rapide et Absolument Sécurisé."
        },
        bar_cocktails: {
          title: "Bar & Cocktails",
          subtitle: "Profitez de boissons gratuites à notre Bar de luxe",
          description: "tout en vous relaxant."
        },
        medical_hygiene: {
          title: "Hygiène Médicale",
          subtitle: "Stérilisation Autoclave de qualité hospitalière",
          description: "processus. La sécurité d'abord."
        },
        large_space: {
          title: "10 000+ SQF",
          subtitle: "Le plus grand espace à Houston,",
          description: "conçu pour l'intimité et la classe."
        }
      },
      
      bnb_section: {
        card_title: "Réseautage Crypto",
        card_desc: "Tous les dimanches au Lounge",
        card_btn: "Rejoignez-nous",
        badge: "Futur de la Beauté",
        title_1: "Bitcoin Nail Bar",
        title_2: "Premier & Unique",
        desc: "Chez Bitcoin Nail Bar, nous ne faisons pas que de la beauté. Nous créons un écosystème où l'art rencontre la technologie. Payer des services avec vos profits d'investissement n'a jamais été aussi élégant.",
        feature_1_title: "Connaissance Crypto",
        feature_1_desc: "Réseautez avec des experts, mettez à jour les tendances du marché tout en profitant des services de Spa Pédicure.",
        feature_2_title: "Paiement 4.0",
        feature_2_desc: "Scannez le code QR et payez instantanément avec Bitcoin, ETH, USDT ou le portefeuille VLinkPay. Pas d'espèces, pas de tracas.",
        btn_register: "S'INSCRIRE À VLINKPAY"
      },
      
      about: {
        badge: "À Propos",
        title: "Le Premier Nail Bar de Luxe Marque Bitcoin au Monde",
        desc_1: "Bitcoin Nail Bar™ est le tout premier salon de beauté au monde construit sous la marque Bitcoin—établissant une nouvelle norme en fusionnant luxe, art et technologie blockchain.",
        desc_2: "S'étendant sur plus de 10 000 SQFT, notre espace est conçu comme un Centre d'Expérience Beauté Haut de Gamme, où les clients entrent dans un environnement futuriste alliant esthétique élégante et liberté des paiements numériques modernes.",
        desc_3: "Ici, la beauté rencontre l'innovation. Les clients peuvent profiter de soins des ongles premium, services spa, cils, massages et un salon de relaxation complet—le tout rehaussé par un design futuriste et des options de paiement crypto transparentes.",
        
        vision: {
          title: "NOTRE VISION",
          desc: "Redéfinir l'industrie mondiale de la beauté en devenant le leader mondial du Nail Bar Beauty-Tech, où :",
          items: [
            "L'esthétique de luxe rencontre la blockchain de pointe",
            "La crypto devient une partie naturelle de la vie quotidienne",
            "Les clients profitent d'une expérience de service intelligente, sécurisée et moderne",
            "L'innovation façonne le fonctionnement des services de beauté à l'avenir"
          ]
        },
        mission: {
          title: "NOTRE MISSION",
          items: [
             { title: "Intégrer la Crypto à la Beauté Quotidienne", desc: "Premier aux É.-U. à accepter BTC, ETH, USDT, VMM, USDV. Rendre la crypto pratique & accessible." },
             { title: "Expérience de Luxe à Grande Échelle", desc: "Lounge de 10 000 SQFT, intérieurs style resort et normes d'hygiène de premier ordre." },
             { title: "Construire une Communauté Visionnaire", desc: "Connecter les pionniers qui adoptent la technologie et le style de vie de luxe moderne." },
             { title: "Autonomiser les Professionnels", desc: "Excellente rémunération, développement des compétences et un environnement professionnel respectueux." }
          ]
        }
      },
      
      hygiene: {
        badge: "Santé & Sécurité D'abord",
        title: "Bar à Ongles Hygiénique",
        desc: "Votre santé et votre sécurité sont nos priorités absolues. Nous maintenons les normes d'hygiène et d'assainissement les plus élevées, dépassant les réglementations de l'industrie.",
        items: [
          "Stérilisation en autoclave",
          "Limes et polissoirs à usage unique",
          "Désinfection de qualité médicale",
          "Kits d'outils individuels",
          "Filtration de l'air HEPA",
          "Désinfection UV",
          "Doublures jetables",
          "Techniciens agréés"
        ]
      },
      
      services: {
        badge: "Services Premium",
        title: "Soins Signature",
        desc: "Découvrez la convergence du luxe et de la technologie. Nos soins signature intègrent des éléments précieux comme l'or 24 carats et la poussière de diamant, payables directement avec votre cryptomonnaie préférée.",
        items: [
          "Pédicure Or Bitcoin",
          "Suites VIP Privées",
          "Manucure Gel Diamant",
          "Produits Vérifiés par Blockchain",
          "Soins du Visage Crypto Glow",
          "Paiements Lightning Instantanés",
          "Récupération des Tissus Profonds",
          "Adhésion NFT Exclusive"
        ],
        btn: "Explorer le Menu"
      },
      promotions: {
        badge: "Offres à Durée Limitée",
        title: "Promotions Exclusives",
        card_1: {
          title: "20% OFF",
          subtitle: "GRANDE OUVERTURE",
          desc: "Célébrez notre lancement avec 20% de réduction sur tous les services pour votre première visite. Découvrez le luxe pour moins.",
          btn: "Réserver Maintenant"
        },
        card_2: {
          badge: "POPULAIRE",
          title: "GRATUIT",
          subtitle: "COCKTAILS & BOISSONS",
          desc: "Profitez de cocktails premium, champagne ou boissons gazeuses offerts avec tout service supérieur à 50$.",
          btn: "Voir le Menu"
        },
        card_3: {
          title: "CADEAU 20$",
          subtitle: "RECOMMANDEZ UN AMI",
          desc: "Amenez un ami et vous recevrez tous les deux un bon de 20$ pour votre prochaine visite. Partager c'est prendre soin!",
          btn: "Rejoindre le Club"
        }
      },
      vip_club: {
        badge: "Club VIP Bitcoin",
        title_1: "Rejoignez le Club VIP &",
        title_2: "Obtenez des Récompenses Exclusives",
        desc_part_1: "Devenez membre de",
        desc_part_2: "pour profiter de privilèges exclusifs réservés aux clients fidèles et détenteurs de crypto.",
        feature_1_title: "5% de Points de Remboursement",
        feature_1_desc: "Recevez 5% de la valeur de la facture sur votre compte membre pour chaque utilisation du service.",
        feature_2_title: "Cadeaux d'Anniversaire",
        feature_2_desc: "Service Spa Pédicure premium gratuit pendant votre mois d'anniversaire.",
        form: {
          title: "Rejoindre l'Elite Club",
          subtitle: "Débloquez l'avenir des services de beauté",
          name_label: "Nom Complet",
          name_placeholder: "Entrez votre nom complet",
          phone_label: "Numéro de Téléphone",
          phone_placeholder: "Entrez votre numéro de téléphone",
          btn: "S'inscrire Gratuitement",
          footer: "Nous nous engageons à une sécurité absolue de l'information."
        }
      },

      membership: {
        badge: "VOTRE STYLE",
        title: "Forfaits d'Adhésion Annuels",
        most_popular: "LE PLUS POPULAIRE",
        save: "ÉCONOMISEZ",
        entry_level: "NIVEAU D'ENTRÉE",
        period: "/an",
        valued_at: "VALEUR DE",
        plans: {
          silver: {
            name: "ARGENT",
            subtitle: "NIVEAU D'ENTRÉE",
            button: "REJOINDRE ARGENT",
            features: [
              "Accès aux Prix Membres",
              "10% Cashback en Bitcoin",
              "Retrait Gel Gratuit",
              "Cadeau d'Anniversaire (25$)"
            ]
          },
          gold: {
            name: "OR",
            subtitle: "OR",
            button: "REJOINDRE OR",
            features: [
              "Crédit Mensuel de 50$",
              "10% Cashback sur Services",
              "Réservation Prioritaire",
              "25% Remise Anniversaire"
            ]
          },
          platinum: {
            name: "PLATINE",
            subtitle: "PLATINE",
            button: "REJOINDRE PLATINE",
            features: [
              "Crédit Mensuel de 60$",
              "15% Cashback sur Services",
              "Accès Lounge VIP",
              "Boissons Premium Incluses"
            ]
          },
          vip_crypto: {
            name: "VIP CRYPTO",
            subtitle: "VIP CRYPTO",
            button: "REJOINDRE VIP",
            features: [
              "Crédit Mensuel de 80$",
              "20% Cashback (Meilleure Valeur)",
              "Avantages Tout Inclus",
              "Bonus Paiement Crypto"
            ]
          }
        }
      },
      
      why_exists: {
        title: "POURQUOI BITCOIN NAIL BAR™ EXISTE",
        subtitle_1: "L'industrie de la beauté évolue.",
        subtitle_2: "Les consommateurs évoluent.",
        subtitle_3: "La technologie évolue.",
        lead: "Bitcoin Nail Bar™ a été créé pour établir un nouveau standard :",
        feature_1: "Un salon de manucure de luxe sur une échelle rarement vue",
        feature_2: "Une marque futuriste alimentée par la culture blockchain",
        feature_3_title: "Paiements Crypto Acceptés",
        feature_3_desc: "Paiements rapides et sécurisés avec Bitcoin & altcoins majeures. Sans friction.",
        feature_4: "Le premier salon de manucure à porter fièrement le nom de Bitcoin",
        feature_5: "Un espace de 10 000 SQFT qui redéfinit ce qu'un salon de manucure peut être",
        cta_line_1: "Nous ne créons pas simplement un salon de manucure.",
        cta_line_2: "Nous construisons un icône."
      },
      
      main_services: {
        title: "Services Principaux",
        subtitle: "Explorez notre large gamme de traitements de soins de manucure premium",
        classic_manicure: "Manucure Classique",
        gel_manicure: "Manucure Gel",
        spa_pedicure: "Pédicure Spa",
        nail_art: "Art des Ongles",
        acrylic_nails: "Ongles d'Acrilique",
        nail_extensions: "Extensions d'Ongles",
        view_all: "Voir Tous les Services"
      }
    },
    coming_soon: {
      status: "En Cours",
      title_1: "Quelque Chose d'Extraordinaire",
      title_2: "Arrive",
      desc: "Nous créons une expérience révolutionnaire pour notre système de lieux et d'avis. L'avenir de la beauté tech de luxe mérite l'attente.",
      return_home: "Retour à l'Accueil",
      book_now: "Réserver Maintenant"
    },
    booking_page: {
      subtitle: "Choisissez vos services et horaire préféré. Nous nous occupons du reste!",
      back: "Retour",
      steps: {
        services: "Sélectionner Services",
        services_desc: "Choisissez un ou plusieurs services que vous souhaitez réserver",
        time: "Sélectionner Date et Heure",
        time_desc: "Choisissez votre heure de rendez-vous préférée",
        technician: "Sélectionner Technicien",
        details: "Vos Détails",
        details_desc: "Veuillez fournir vos coordonnées",
        confirm: "Confirmation"
      },
      technician: {
        desc: "Choisissez votre expert préféré",
        no_preference: "Sans Préférence",
        no_preference_desc: "Nous assignerons le prochain technicien senior disponible"
      },
      form: {
        name: "Nom Complet",
        phone: "Numéro de Téléphone",
        email: "Adresse E-mail",
        optional: "(Optionnel)",
        request: "Demandes Spéciales (Optionnel)",
        notes: "Notes",
        notes_placeholder: "Demandes spéciales ou notes...",
        confirm: "Confirmer Réservation",
        confirm_book: "Confirmer Réservation",
        continue: "Continuer"
      },
      services: {
        loading: "Chargement des services...",
        all: "Tous les Services",
        select_continue: "Sélectionnez un Service pour Continuer",
        no_category: "Aucun service trouvé dans cette catégorie.",
        total_estimated: "Total Estimé:"
      },
      time: {
        select_date: "Sélectionner Date",
        select_time: "Sélectionner Heure",
        no_slots: "Aucun créneau disponible pour aujourd'hui.",
        choose_another_day: "Veuillez choisir un autre jour."
      },
      summary: {
        title: "Résumé de Réservation",
        services: "Services:",
        date: "Date:",
        time: "Heure:",
        technician: "Technicien:",
        total: "Total:"
      },
      processing: "Traitement en cours...",
      errors: {
        required_fields: "Veuillez remplir tous les champs requis",
        booking_failed: "Échec de la réservation. Veuillez réessayer.",
        general: "Une erreur s'est produite. Veuillez réessayer."
      },
      success: "Réservation Confirmée !"
    },
    service_translations: {
      classic_manicure: {
        name: "Manucure Classique",
        description: "Forme, polissage, soin des cuticules et vernis"
      },
      gel_manicure: {
        name: "Manucure Gel",
        description: "Vernis gel longue durée"
      },
      spa_pedicure: {
        name: "Pédicure Spa",
        description: "Expérience ultime de soins des pieds"
      },
      nail_art_design: {
        name: "Design d'Art des Ongles",
        description: "Designs artistiques personnalisés"
      },
      acrylic_nails: {
        name: "Ongles Acryliques",
        description: "Extensions acryliques durables"
      },
      nail_extensions: {
        name: "Extensions d'Ongles",
        description: "Belle longueur et forme"
      },
      duration_unit: "min"
    },
    services_page: {
      hero_title: "Services de",
      hero_title_highlight: "Classe Mondiale",
      hero_desc: "Découvrez le summum du luxe avec nos soins inspirés du Bitcoin.",
      art_title: "L'Art du",
      art_highlight: "Soin des Ongles Moderne",
      art_desc: "Chez Bitcoin Nail Bar, chaque service est une expérience. Nous combinons techniques traditionnelles et technologie moderne pour garantir précision, hygiène et beauté durable.",
      premium_materials: "Matériaux Premium",
      premium_desc: "Nous utilisons uniquement des vernis biologiques et non toxiques.",
      menu_title: "Notre Menu",
      service_menu: {
        title: "Menu de Services",
        subtitle: "Soins Complets",
        headers: {
          service: "Service",
          regular: "Régulier",
          member: "Membre"
        },
        categories: {
          acrylic: "Services d'Ongles en Acrylique",
          dipping: "Poudre Trempée",
          gel: "Service Gel Shellac",
          waxing: "Services d'Épilation",
          pedicure: "Pédicure",
          manicure: "Manucure",
          kids: "Services Enfants",
          additional: "Services Supplémentaires"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "ENSEMBLE COMPLET",
                items: [
                  { name: "Acrylique avec vernis", regular: 45, member: 35 },
                  { name: "Pointe blanche ou perle", regular: 45, member: 35 },
                  { name: "Poudre rose uniquement", regular: 45, member: 35 },
                  { name: "Poudre couleur unie", regular: 45, member: 35 },
                  { name: "Acrylique avec shellac", regular: 50, member: 40 },
                  { name: "Rose et blanc", regular: 55, member: 45 },
                  { name: "Ombre 2 couleurs", regular: 55, member: 45 },
                  { name: "Ombre 3 couleurs", regular: 60, member: 50 }
                ]
              },
              {
                name: "REMPLISSAGE D'ONGLES ACRYLIQUES",
                items: [
                  { name: "Remplissage même couleur", regular: 35, member: 30 },
                  { name: "Changer de couleur", regular: 40, member: 33 },
                  { name: "Remplissage acrylique avec shellac", regular: 45, member: 35 },
                  { name: "Remplissage rose et blanc", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "POUDRE TREMPÉE",
                items: [
                  { name: "Superposition trempée", regular: 45, member: 40 },
                  { name: "Ensemble complet trempé", regular: 50, member: 45 },
                  { name: "Trempé rose et blanc", regular: 55, member: 50 },
                  { name: "Trempé ombre", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "SERVICES GEL",
                items: [
                  { name: "Manucure gel", regular: 40, member: 35 },
                  { name: "Pédicure gel", regular: 50, member: 45 },
                  { name: "Changement vernis gel (Mains)", regular: 25, member: 20 },
                  { name: "Changement vernis gel (Pieds)", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "VISAGE",
                items: [
                  { name: "Sourcils", regular: 15, member: 12 },
                  { name: "Lèvre", regular: 10, member: 8 },
                  { name: "Menton", regular: 12, member: 10 },
                  { name: "Visage complet", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "SOINS DE PÉDICURE",
                items: [
                  { name: "Pédicure classique", regular: 35, member: 30 },
                  { name: "Pédicure de luxe", regular: 50, member: 45 },
                  { name: "Pédicure signature Bitcoin", regular: 75, member: 65 },
                  { name: "Pédicure Spa volcan", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "SOINS DE MANUCURE",
                items: [
                  { name: "Manucure classique", regular: 25, member: 20 },
                  { name: "Manucure de luxe", regular: 35, member: 30 },
                  { name: "Manucure signature Bitcoin", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "POUR ENFANTS (Moins de 10 ans)",
                items: [
                  { name: "Manucure", regular: 15, member: 12 },
                  { name: "Pédicure", regular: 25, member: 22 },
                  { name: "Changement vernis (Mains)", regular: 10, member: 8 },
                  { name: "Changement vernis (Pieds)", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "COMPLÉMENTS",
                items: [
                  { name: "Réparation d'ongle", regular: 5, member: 0 },
                  { name: "Retrait d'ongles", regular: 15, member: 10 },
                  { name: "Cire de paraffine", regular: 10, member: 8 },
                  { name: "Retrait de callosités", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "Réserver Cette Catégorie",
      find_location: "Trouver le Lieu le Plus Proche",
      book_appointment: "Réserver Votre Rendez-vous",
      ready_title: "Prêt à Découvrir le Futur ?",
      ready_desc: "Rejoignez les milliers de clients qui sont passés au standard Bitcoin Nail Bar.",
      categories: {
        signature: {
          title: "Soins Signature",
          desc: "Découvrez le summum du luxe avec nos soins inspirés du Bitcoin.",
          items: [
            { name: "Pédicure Or Bitcoin", price: "$150", desc: "Trempage or 24K, infusion CBD, massage tissus profonds." },
            { name: "Manucure Gel Diamant", price: "$85", desc: "Exfoliation à la poussière de diamant réelle avec finition gel premium." },
            { name: "Soin Visage Crypto Glow", price: "$120", desc: "Thérapie LED combinée avec peeling enzymatique bio." }
          ]
        },
        comprehensive: {
          title: "Soins Complets",
          desc: "Soins essentiels élevés à un standard de luxe.",
          items: [
            { name: "Manucure Classique", price: "$45", desc: "Soin des cuticules, massage et vernis régulier." },
            { name: "Changement Vernis Gel", price: "$35", desc: "Retrait et application de couleur gel premium." },
            { name: "Pose Complète Acrylique", price: "$75+", desc: "Extensions sculptées avec mise en forme précise." },
            { name: "Nail Art", price: "$15+", desc: "Designs personnalisés, pierres précieuses et embellissements artistiques." }
          ]
        }
      }
    },
    footer: {
      desc: "Services de soins des ongles premium avec une touche futuriste. Le premier salon de luxe intégré crypto au monde.",
      accept: "Nous Acceptons",
      quick_links: "Liens Rapides",
      popular_services: "Services Populaires",
      contact: "Contactez-nous",
      rights: "Tous droits réservés."
    },
    careers: {
      badge: "CARRIÈRES ET OPPORTUNITÉS",
      title: "Rejoignez l'Équipe d'Élite",
      desc: "Êtes-vous un technicien ongulaire talentueux ou un expert beauté à la recherche d'un environnement prestigieux pour présenter vos compétences ? Bitcoin Nail Bar offre le package de rémunération le plus compétitif de l'industrie.",
      features: [
        "Haute Commission + 100% de Pourboires",
        "Environnement de travail moderne et high-tech (10 000 SQFT)",
        "Formation continue et développement des compétences",
        "Horaires flexibles et gestion bienveillante"
      ],
      cta: "POSTULER AUJOURD'HUI",
      salary_badge_title: "Salaire le Plus Élevé",
      salary_badge_subtitle: "DANS LA RÉGION DE HOUSTON"
    },
    ready_cta: {
      instagram: "SUIVEZ-NOUS SUR INSTAGRAM",
      title: "Prêt à Transformer Votre Look ?",
      desc: "Réservez votre rendez-vous aujourd'hui et découvrez le summum des soins des ongles de luxe. Votre voyage vers de beaux ongles sains commence ici.",
      btn_book: "Réserver Rendez-vous Maintenant",
      btn_explore: "Explorer les Services"
    },
    egift: {
      badge: "LE CADEAU PARFAIT",
      desc: "Surprenez vos proches avec une clé numérique vers la relaxation. Livré instantanément par Email/SMS.",
      send: "Envoyer",
      luxury: "LUXE",
      instantly: "Instantanément",
      ai_messages: [
        "Je vous souhaite une journée relaxante remplie de soins et de joie !",
        "Offrez-vous le luxe que vous méritez. Profitez-en !",
        "Un petit quelque chose pour illuminer votre journée. Meilleurs vœux !",
        "Détendez-vous, rafraîchissez-vous et rechargez-vous. Vous l'avez mérité !",
        "Je vous envoie de l'amour et un moment de pur bonheur."
      ]
    }
  },

  zh: {
    nav: {
      home: "首页",
      about_us: "关于我们",
      services: "服务",
      promotions: "促销活动",
      egift: "电子礼品卡",
      membership: "会员",
      careers: "招聘",
      gallery: "画廊",
      booking: "预约",
      staff: "员工",
      locations: "位置",
      reviews: "评价",
      contact: "联系我们"
    },
    bottom_nav: {
      home: "首页",
      services: "服务",
      booking: "预约",
      membership: "会员",
      egift: "电子礼品"
    },
    chatbot: {
      online: "在线",
      input_placeholder: "询问服务...",
      welcome: "你好！欢迎来到比特币美甲吧。💅✨ 我可以帮你找到完美的奢华护理或预约时间。今天有什么可以帮你的吗？",
      error: "我现在连接网络有点问题。请稍后再试！",
      bubbles: [
        "你好！需要帮助吗？👋",
        "需要帮忙预约吗？💅",
        "探索我们的奢华水疗！✨",
        "我们在这里为您服务！💬"
      ]
    },
    home: {
      badge: "全美首家比特币美甲沙龙",
      hero_unlock: "解锁",
      hero_vip_status: "VIP 身份",
      hero_get_rewards: "获得奖励",
      hero_desc_new_1: "通过我们的提升您的美容体验",
      hero_membership_program: "会员计划",
      hero_enjoy_up_to: "享受高达",
      hero_cashback_20: "20% 返现",
      hero_priority_access: "优先预订和独家访问。",
      cta_view_packages: "查看套餐",
      cta_design_card: "设计您的卡片",
      card_valid_thru: "有效期至",
      card_10_off: "10% 折扣",
      card_vip_membership: "VIP 会员",
      card_cashback: "返现",
      hero_title_1: "奢华",
      hero_title_2: "美丽",
      hero_title_3: "创新",
      hero_desc_1: "高端美甲艺术遇上精英",
      hero_desc_1_bold: "加密社区",
      hero_desc_2: "体验全美首个",
      hero_desc_2_bold_1: "10,000 平方英尺",
      hero_desc_2_part_2: "接受",
      hero_desc_2_bold_2: "加密支付的空间",
      cta_book: "立即预约",
      cta_vip: "加入 VIP 俱乐部",

      features_section: {
        crypto_payments: {
          title: "加密支付",
          subtitle: "接受比特币、USDT、VLINKPAY。",
          description: "快速且绝对安全。"
        },
        bar_cocktails: {
          title: "酒吧与鸡尾酒",
          subtitle: "在我们的豪华酒吧享受免费饮品",
          description: "同时放松身心。"
        },
        medical_hygiene: {
          title: "医疗卫生",
          subtitle: "医院级高压灭菌",
          description: "流程。安全第一。"
        },
        large_space: {
          title: "10,000+ 平方英尺",
          subtitle: "休斯顿最大的空间，",
          description: "专为隐私和品味而设计。"
        }
      },
      
      bnb_section: {
        card_title: "加密社交",
        card_desc: "每周日在休息室",
        card_btn: "加入我们",
        badge: "美丽的未来",
        title_1: "比特币美甲吧",
        title_2: "首家且唯一",
        desc: "在比特币美甲吧，我们不仅仅做美容。我们创造了一个艺术遇上技术的生态系统。用投资利润支付服务从未如此时尚。",
        feature_1_title: "加密知识",
        feature_1_desc: "在享受足部水疗服务的同时，与专家交流，更新市场趋势。",
        feature_2_title: "支付 4.0",
        feature_2_desc: "扫描二维码，即刻使用比特币、ETH、USDT 或 VLinkPay 钱包支付。��现金，无烦恼。",
        btn_register: "注册 VLINKPAY"
      },
      
      about: {
        badge: "关于我们",
        title: "全球首家比特币品牌奢华美甲吧",
        desc_1: "比特币美甲吧™是全球首家以比特币品牌建立的美容休息室——通过融合奢华、艺术和区块链技术树立了新标准。",
        desc_2: "我们的空间占地超过 10,000 平方英尺，设计为高端美容体验中心，客户进入一个结合优雅美学与现代数字支付自由的未来环境。",
        desc_3: "在这里，美丽遇上创新。客户可以享受顶级美甲护理、水疗服务、睫毛、按摩和完整的放松休息室——所有这些都由未来主义设计和无缝加密支付选项提升。",
        
        vision: {
          title: "我们的愿景",
          desc: "通过成为全球领先的美妆科技美甲吧重新定义全球美容行业，在这里：",
          items: [
            "奢华美学遇上尖端区块链",
            "加密货币成为日常生活的自然组成部分",
            "客户享受智能、安全和现代的服务体验",
            "创新塑造未来美容服务的运作方式"
          ]
        },
        mission: {
          title: "我们的使命",
          items: [
             { title: "将加密带入日常美容", desc: "全美首家接受 BTC、ETH、USDT、VMM、USDV。让加密变得实用且易于访问。" },
             { title: "规模化奢华体验", desc: "10,000 平方英尺休息室，度假村风格内饰和顶级卫生标准。" },
             { title: "建立前瞻性社区", desc: "连接拥抱技术和现代奢华生活方式的先驱者。" },
             { title: "赋能专业人士", desc: "优厚的薪酬、技能发展和受尊重的职业环境。" }
          ]
        }
      },
      
      hygiene: {
        badge: "健康与安全第一",
        title: "卫生美甲吧",
        desc: "您的健康和安全是我们的首要任务。我们保持最高的卫生和消毒标准，超越行业规定。",
        items: [
          "高压灭菌消毒",
          "一次性锉刀和抛光块",
          "医疗级消毒",
          "个人工具包",
          "HEPA 空气过滤",
          "紫外线消毒",
          "一次性衬垫",
          "持证技师"
        ]
      },
      
      services: {
        badge: "高级服务",
        title: "特色护理",
        desc: "体验奢华与技术的融合。我们的特色护理包含 24K 金和钻石粉末等珍贵元素，可直接用您喜欢的加密货币支付。",
        items: [
          "比特币黄金足部护理",
          "私人 VIP 套房",
          "钻石凝胶美甲",
          "区块链验证产品",
          "加密焕肤面部护理",
          "即时闪电支付",
          "深层组织恢复",
          "独家 NFT 会员资格"
        ],
        btn: "探索菜单"
      },
      promotions: {
        badge: "限时优惠",
        title: "独家促销",
        card_1: {
          title: "20% 折扣",
          subtitle: "盛大开业",
          desc: "首次光临享受所有服务8折优惠，庆祝我们的启动。以更低的价格体验奢华。",
          btn: "立即预订"
        },
        card_2: {
          badge: "热门",
          title: "免费",
          subtitle: "鸡尾酒和饮品",
          desc: "消费超过50美元的任何服务即可享受免费高级鸡尾酒、香槟或软饮。",
          btn: "查看菜单"
        },
        card_3: {
          title: "20美元礼物",
          subtitle: "推荐朋友",
          desc: "带朋友来，你们两人都将获得20美元的优惠券用于下次光临。分享就是关怀！",
          btn: "加入俱乐部"
        }
      },
      vip_club: {
        badge: "比特币VIP俱乐部",
        title_1: "加入VIP俱乐部&",
        title_2: "获得独家奖励",
        desc_part_1: "成为",
        desc_part_2: "会员，享受为忠实客户和加密货币持有者保留的独家特权。",
        feature_1_title: "5%返现积分",
        feature_1_desc: "每次使用服务时，将账单价值的5%存入您的会员账户。",
        feature_2_title: "生日礼物",
        feature_2_desc: "生日月免费高级Spa足疗服务。",
        form: {
          title: "加入精英俱乐部",
          subtitle: "解锁美容服务的未来",
          name_label: "全名",
          name_placeholder: "输入您的全名",
          phone_label: "电话号码",
          phone_placeholder: "输入电话号码",
          btn: "免费注册",
          footer: "我们承诺绝对的信息安全。"
        }
      },

      membership: {
        badge: "您的形象",
        title: "年度会员套餐",
        most_popular: "最受欢迎",
        save: "节省",
        entry_level: "入门级",
        period: "/年",
        valued_at: "价值",
        plans: {
          silver: {
            name: "白银",
            subtitle: "入门级",
            button: "加入白银",
            features: [
              "享受会员价格",
              "10% 比特币返现",
              "免费卸甲",
              "生日礼物 ($25)"
            ]
          },
          gold: {
            name: "黄金",
            subtitle: "黄金",
            button: "加入黄金",
            features: [
              "每月 $50 信用额度",
              "10% 服务返现",
              "优先预订",
              "生日 25% 折扣"
            ]
          },
          platinum: {
            name: "白金",
            subtitle: "白金",
            button: "加入白金",
            features: [
              "每月 $60 信用额度",
              "15% 服务返现",
              "VIP 休息室使用权",
              "包含高级饮品"
            ]
          },
          vip_crypto: {
            name: "VIP 加密",
            subtitle: "VIP 加密",
            button: "加入 VIP",
            features: [
              "每月 $80 信用额度",
              "20% 返现 (超值)",
              "全包特权",
              "加密支付奖金"
            ]
          }
        }
      },
      
      why_exists: {
        title: "为什么存在 BITCOIN NAIL BAR™",
        subtitle_1: "美容行业正在发展。",
        subtitle_2: "消费者正在发展。",
        subtitle_3: "技术正在发展。",
        lead: "Bitcoin Nail Bar™ 创建的目的是设定新的基准：",
        feature_1: "一个罕见规模的奢华美甲沙龙",
        feature_2: "一个由区块链文化驱动的未来品��",
        feature_3_title: "接受加密支付",
        feature_3_desc: "使用比特币和主要替代币进行快速、安全的支付。零摩擦。",
        feature_4: "第一个自豪地使用比特币名称的美甲沙龙",
        feature_5: "一个重新定义美甲沙龙可能是什么样的 10,000 SQFT 空间",
        cta_line_1: "我们不仅仅开设一个美甲沙龙。",
        cta_line_2: "我们正在建立一个标志。"
      },
      
      main_services: {
        title: "主要服务",
        subtitle: "探索我们全面的高级美甲护理服务",
        classic_manicure: "经典美甲",
        gel_manicure: "凝胶美甲",
        spa_pedicure: "SPA足部护理",
        nail_art: "美甲艺术",
        acrylic_nails: "丙烯酸指甲",
        nail_extensions: "指甲延长",
        view_all: "查看所有服务"
      }
    },
    coming_soon: {
      status: "进行中",
      title_1: "非凡之物",
      title_2: "即将到来",
      desc: "我们正在为我们的地点和评论系统打造革命性体验。奢华美容科技的未来值得等待。",
      return_home: "返回首页",
      book_now: "立即预约"
    },
    booking_page: {
      subtitle: "选择您的服务和首选时间。我们会处理其余的事情！",
      back: "返回",
      steps: {
        services: "选择服务",
        services_desc: "选择一个或多个您想预约的服务",
        time: "选择日期和时间",
        time_desc: "选择您首选的预约时间",
        technician: "选择技师",
        details: "您的详细信息",
        details_desc: "请提供您的联系信息",
        confirm: "确认"
      },
      technician: {
        desc: "选择您偏好的专家",
        no_preference: "无偏好",
        no_preference_desc: "我们将分配下一位可用的高级技师"
      },
      form: {
        name: "全名",
        phone: "电话号码",
        email: "电子邮件",
        optional: "（可选）",
        request: "特殊要求（可选）",
        notes: "备注",
        notes_placeholder: "任何特殊要求或备注...",
        confirm: "确认预约",
        confirm_book: "确认预约",
        continue: "继续"
      },
      services: {
        loading: "加载服务中...",
        all: "所有服务",
        select_continue: "选择服务以继续",
        no_category: "此类别中没有找到服务。",
        total_estimated: "预计总额："
      },
      time: {
        select_date: "选择日期",
        select_time: "选择时间",
        no_slots: "今天没有可用时段。",
        choose_another_day: "请选择其他日期。"
      },
      summary: {
        title: "预约摘要",
        services: "服务：",
        date: "日期：",
        time: "时间：",
        technician: "技师：",
        total: "总计："
      },
      processing: "处理中...",
      errors: {
        required_fields: "请填写所有必填字段",
        booking_failed: "预约失败。请重试。",
        general: "发生错误。请重试。"
      },
      success: "预约已确认！"
    },
    service_translations: {
      classic_manicure: {
        name: "经典美甲",
        description: "修型、抛光、护理角质层和上色"
      },
      gel_manicure: {
        name: "凝胶美甲",
        description: "持久凝胶指甲油"
      },
      spa_pedicure: {
        name: "水疗足疗",
        description: "终极足部护理体验"
      },
      nail_art_design: {
        name: "美甲艺术设计",
        description: "定制艺术设计"
      },
      acrylic_nails: {
        name: "水晶甲",
        description: "耐用的水晶甲延长"
      },
      nail_extensions: {
        name: "延甲",
        description: "美丽的长度和形状"
      },
      duration_unit: "分钟"
    },
    services_page: {
      hero_title: "世界级",
      hero_title_highlight: "服务",
      hero_desc: "体验我们受比特币启发的奢华护理的巅峰。",
      art_title: "艺术",
      art_highlight: "现代美甲护理",
      art_desc: "在比特币美甲吧，每项服务都是一种体验。我们结合传统技术与现代科技，确保精准、卫生和持久美丽。",
      premium_materials: "高级材料",
      premium_desc: "我们只使用有机、无毒的指甲油。",
      menu_title: "我们的菜单",
      service_menu: {
        title: "服务菜单",
        subtitle: "全面护理",
        headers: {
          service: "服务",
          regular: "常规",
          member: "会员"
        },
        categories: {
          acrylic: "丙烯酸美甲服务",
          dipping: "浸粉",
          gel: "凝胶Shellac服务",
          waxing: "脱毛服务",
          pedicure: "足部护理",
          manicure: "手部护理",
          kids: "儿童服务",
          additional: "附加服务"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "全套",
                items: [
                  { name: "丙烯酸加普通指甲油", regular: 45, member: 35 },
                  { name: "白色或珍珠尖", regular: 45, member: 35 },
                  { name: "仅粉红粉", regular: 45, member: 35 },
                  { name: "粉末纯色", regular: 45, member: 35 },
                  { name: "丙烯酸加shellac", regular: 50, member: 40 },
                  { name: "粉红和白色", regular: 55, member: 45 },
                  { name: "渐变2色", regular: 55, member: 45 },
                  { name: "渐变3色", regular: 60, member: 50 }
                ]
              },
              {
                name: "丙烯酸美甲补充",
                items: [
                  { name: "相同颜色补充", regular: 35, member: 30 },
                  { name: "更换颜色", regular: 40, member: 33 },
                  { name: "丙烯酸补充加shellac", regular: 45, member: 35 },
                  { name: "粉红和白色补充", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "浸粉",
                items: [
                  { name: "浸粉覆盖", regular: 45, member: 40 },
                  { name: "浸粉全套", regular: 50, member: 45 },
                  { name: "浸粉粉红和白色", regular: 55, member: 50 },
                  { name: "浸粉渐变", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "凝胶服务",
                items: [
                  { name: "凝胶美甲", regular: 40, member: 35 },
                  { name: "凝胶足部护理", regular: 50, member: 45 },
                  { name: "凝胶指甲油更换（手）", regular: 25, member: 20 },
                  { name: "凝胶指甲油更换（脚）", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "面部",
                items: [
                  { name: "眉毛", regular: 15, member: 12 },
                  { name: "唇部", regular: 10, member: 8 },
                  { name: "下巴", regular: 12, member: 10 },
                  { name: "全脸", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "足部护理疗程",
                items: [
                  { name: "经典足部护理", regular: 35, member: 30 },
                  { name: "豪华足部护理", regular: 50, member: 45 },
                  { name: "比特币特色足部护理", regular: 75, member: 65 },
                  { name: "火山SPA足部护理", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "手部护理疗程",
                items: [
                  { name: "经典美甲", regular: 25, member: 20 },
                  { name: "豪华美甲", regular: 35, member: 30 },
                  { name: "比特币特色美甲", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "儿童（10岁以下）",
                items: [
                  { name: "美甲", regular: 15, member: 12 },
                  { name: "足部护理", regular: 25, member: 22 },
                  { name: "指甲油更换（手）", regular: 10, member: 8 },
                  { name: "指甲油更换（脚）", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "附加项",
                items: [
                  { name: "指甲修复", regular: 5, member: 0 },
                  { name: "卸甲", regular: 15, member: 10 },
                  { name: "石蜡蜡", regular: 10, member: 8 },
                  { name: "老茧去除", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "预约此类别",
      find_location: "查找最近位置",
      book_appointment: "预约您的约会",
      ready_title: "准备好体验未来了吗？",
      ready_desc: "加入数千名已转向比特币美甲吧标准的客户。",
      categories: {
        signature: {
          title: "特色护理",
          desc: "体验我们受比特币启发的奢华护理的巅峰。",
          items: [
            { name: "比特币黄金足部护理", price: "$150", desc: "24K金浸泡、CBD注入、深层组织按摩。" },
            { name: "钻石凝胶美甲", price: "$85", desc: "真正钻石粉末去角质，高级凝胶饰面。" },
            { name: "加密焕肤面部护理", price: "$120", desc: "LED疗法结合有机酶剥离。" }
          ]
        },
        comprehensive: {
          title: "全面护理",
          desc: "基本护理提升至奢华标准。",
          items: [
            { name: "经典美甲", price: "$45", desc: "角质层护理、按摩和常规指甲油。" },
            { name: "凝胶指甲油更换", price: "$35", desc: "去除并涂抹高级凝胶颜色。" },
            { name: "丙烯酸全套", price: "$75+", desc: "精确塑形的雕刻延长。" },
            { name: "指甲艺术", price: "$15+", desc: "定制设计、宝石和艺术美甲装饰。" }
          ]
        }
      }
    },
    footer: {
      desc: "具有未来主义色彩的高级美甲护理服务。全球首家加密集成奢华沙龙。",
      accept: "我们接受",
      quick_links: "快速链接",
      popular_services: "热门服务",
      contact: "联系我们",
      rights: "版权所有。"
    },
    careers: {
      badge: "职业与机会",
      title: "加入精英团队",
      desc: "您是一位才华横溢的美甲技师或美容专家，正在寻找一个有声望的环境来展示您的技能吗？比特币美甲吧提供业内最具竞争力的薪酬待遇。",
      features: [
        "高佣金 + 100% 小费",
        "现代化、高科技工作环境（10,000平方英尺）",
        "持续培训和技能发展",
        "灵活排班和支持性管理"
      ],
      cta: "今天申请",
      salary_badge_title: "最高薪酬",
      salary_badge_subtitle: "在休斯顿地区"
    },
    ready_cta: {
      instagram: "在INSTAGRAM上关注我们",
      title: "准备好改变您的外观了吗？",
      desc: "今天预约，体验奢华美甲护理的巅峰。您美丽健康指甲的旅程从这里开始。",
      btn_book: "立即预约",
      btn_explore: "探索服务"
    },
    egift: {
      badge: "完美礼物",
      desc: "用数字钥匙给您的亲人一个放松的惊喜。通过电子邮件/短信即时发送。",
      send: "发送",
      luxury: "奢华",
      instantly: "即时",
      ai_messages: [
        "祝您度过充满宠爱和快乐的轻松一天！",
        "好好犒劳自己，享受您应得的奢华！",
        "一点心意，点亮您的一天。最美好的祝愿！",
        "放松，恢复，充电。这是您应得的！",
        "送给您爱和纯粹幸福的时刻。"
      ]
    }
  },

  ja: {
    nav: {
      home: "ホーム",
      about_us: "私たちについて",
      services: "サービス",
      promotions: "プロモーション",
      egift: "電子ギフトカード",
      membership: "メンバーシップ",
      careers: "採用",
      gallery: "ギャラリー",
      booking: "予約する",
      staff: "スタッフ",
      locations: "場所",
      reviews: "レビュー",
      contact: "お問い合わせ"
    },
    bottom_nav: {
      home: "ホーム",
      services: "サービス",
      booking: "予約",
      membership: "会員",
      egift: "ギフト"
    },
    chatbot: {
      online: "オンライン",
      input_placeholder: "サービスについて聞く...",
      welcome: "こんにちは！ビットコインネイルバーへようこそ。💅✨ 完璧なラグジュアリートリートメントを見つけたり、予約をお手伝いします。今日はどのようなご用件でしょうか？",
      error: "現在ネットワークへの接続に少し問題があります。しばらくしてからもう一度お試しください！",
      bubbles: [
        "こんにちは！お手伝いしますか？👋",
        "予約のサポートが必要ですか？💅",
        "ラグジュアリースパを発見！✨",
        "私たちがお手伝いします！💬"
      ]
    },
    home: {
      badge: "米国初のビットコインネイルサロン",
      hero_unlock: "ロック解除",
      hero_vip_status: "VIPステータス",
      hero_get_rewards: "報酬をゲット",
      hero_desc_new_1: "私たちの",
      hero_membership_program: "メンバーシッププログラム",
      hero_enjoy_up_to: "で美容体験を向上させましょう。最大",
      hero_cashback_20: "20%キャッシュバック",
      hero_priority_access: "優先予約、限定アクセスをお楽しみください。",
      cta_view_packages: "パッケージを見る",
      cta_design_card: "カードをデザイン",
      card_valid_thru: "有効期限",
      card_10_off: "10% オフ",
      card_vip_membership: "VIPメンバーシップ",
      card_cashback: "キャッシュバック",
      hero_title_1: "ラグジュアリー",
      hero_title_2: "ビューティー",
      hero_title_3: "イノベーション",
      hero_desc_1: "ハイエンドなネイルアートと",
      hero_desc_1_bold: "暗号資産コミュニティ",
      hero_desc_2: "米国初の",
      hero_desc_2_bold_1: "10,000 SQFT",
      hero_desc_2_part_2: "のスペースで",
      hero_desc_2_bold_2: "暗号資産決済",
      cta_book: "予約する",
      cta_vip: "VIPクラブに参加",

      features_section: {
        crypto_payments: {
          title: "暗号資産決済",
          subtitle: "ビットコイン、USDT、VLINKPAYを受け入れています。",
          description: "高速かつ絶対に安全。"
        },
        bar_cocktails: {
          title: "バー＆カクテル",
          subtitle: "ラグジュアリーバーで無料ドリンクをお楽しみください",
          description: "リラックスしながら。"
        },
        medical_hygiene: {
          title: "医療衛生",
          subtitle: "病院グレードのオートクレーブ滅菌",
          description: "プロセス。安全第一。"
        },
        large_space: {
          title: "10,000+ SQF",
          subtitle: "ヒューストン最大のスペース、",
          description: "プライバシーとクラスのために設計されました。"
        }
      },
      
      bnb_section: {
        card_title: "暗号資産ネットワーキング",
        card_desc: "毎週日曜日にラウンジで",
        card_btn: "参加する",
        badge: "美容の未来",
        title_1: "ビットコインネイルバー",
        title_2: "最初で唯一",
        desc: "ビットコインネイルバーでは、美容を提供するだけではありません。アートとテクノロジーが出会うエコシステムを創造します。投資利益でサービスを支払うことが、これほどスタイリッシュだったことはありません。",
        feature_1_title: "暗号資産の知識",
        feature_1_desc: "スパペディキュアサービスを楽しみながら、専門家と交流し、市場トレンドをアップデート。",
        feature_2_title: "決済 4.0",
        feature_2_desc: "QRコードをスキャンして、ビットコイン、ETH、USDT、またはVLinkPayウォレットで即座に支払います。現金不要、手間なし。",
        btn_register: "VLINKPAYに登録"
      },
      
      about: {
        badge: "私たちについて",
        title: "世界初のビットコインブランドのラグジュアリーネイルバー",
        desc_1: "ビットコインネイルバー™は、ビットコインブランドの下で構築された世界初のビューティーラウンジであり、ラグジュアリー、芸術性、ブロックチェーン技術を融合させることで新しい基準を打ち立てています。",
        desc_2: "10,000 SQFTを超える私たちのスペースは、ハイエンドビューティーエクスペリエンスセンターとして設計されており、顧客はエレガントな美学と現代のデジタル決済の自由を組み合わせた未来的な環境に足を踏み入れます。",
        desc_3: "ここでは、美しさがイノベーションと出会います。顧客は、未来的なデザインとシームレスな暗号資産決済オプションによって高められた、プレミアムネイルケア、スパサービス、まつげ、マッサージ、完全なリラクゼーションラウンジを楽しむことができます。",
        
        vision: {
          title: "私たちのビジョン",
          desc: "世界をリードするビューティーテックネイルバーになることで、世界の美容業界を再定義すること。ここでは：",
          items: [
            "ラグジュアリーな美学が最先端のブロッチェーンと出会う",
            "暗号資産が日常生活の自然な一部になる",
            "顧客はスマートで安全、かつモダンなサービス体験を楽しむ",
            "イノベーションが将来の美容サービスの運営方法を形作る"
          ]
        },
        mission: {
          title: "私たちのミッション",
          items: [
             { title: "暗号資産を日常の美容へ", desc: "BTC、ETH、USDT、VMM、USDVを受け入れる全米初。暗号資産を実用的でアクセスしやすくする。" },
             { title: "大規模なラグジュアリー体験", desc: "10,000 SQFTのラウンジ、リゾートスタイルのインテリア、最高レベルの衛生基準。" },
             { title: "先見性のあるコミュニティの構築", desc: "テクノロジーと現代のラグジュアリーライフスタイルを受け入れる先駆者を繋ぐ。" },
             { title: "プロフェッショナルのエンパワーメント", desc: "優れた報酬、スキル開発、そして尊重されるキャリア環境。" }
          ]
        }
      },
      
      hygiene: {
        badge: "健康と安全を第一に",
        title: "衛生ネイルバー",
        desc: "あなたの健康と安全は私たちの最優先事項です。私たちは業界の規制を超える最高水準の衛生と消毒を維持しています。",
        items: [
          "オートクレーブ滅菌",
          "使い捨てファイル＆バッファー",
          "医療グレードの消毒",
          "個別のツールキット",
          "HEPA空気ろ過",
          "UV消毒",
          "使い捨てライナー",
          "ライセンスを持つ技術者"
        ]
      },
      
      services: {
        badge: "プレミアムサービス",
        title: "シグネチャートリートメント",
        desc: "ラグジュアリーとテクノロジーの融合を体験してください。私たちのシグネチャートリートメントには、24Kゴールドやダイヤモンドダストなどの貴重な要素が含まれており、お好みの暗号資産で直接支払うことができます。",
        items: [
          "ビットコインゴールドペディキュア",
          "プライベートVIPスイート",
          "ダイヤモンドジェルマニキュア",
          "ブロックチェーン検証済み製品",
          "クリプトグロウフェイシャル",
          "即時ライトニング決済",
          "ディープティシューリカバリー",
          "独占NFTメンバーシップ"
        ],
        btn: "メニューを見る"
      },
      promotions: {
        badge: "期間限定オファー",
        title: "限定プロモーション",
        card_1: {
          title: "20% オフ",
          subtitle: "グランドオープニング",
          desc: "初回訪問時に全サービス20％オフで開店をお祝いしましょう。お得に贅沢を体験。",
          btn: "今すぐ予約"
        },
        card_2: {
          badge: "人気",
          title: "無料",
          subtitle: "カクテルとドリンク",
          desc: "50ドル以上のサービスをご利用いただくと、プレミアムカクテル、シャンパン、またはソフトドリンクが無料。",
          btn: "メニューを見る"
        },
        card_3: {
          title: "20ドルギフト",
          subtitle: "友達を紹介",
          desc: "友達を連れて来ると、お二人とも次回訪問時に20ドルのバウチャーを受け取れます。シェアは思いやり！",
          btn: "クラブに参加"
        }
      },
      vip_club: {
        badge: "ビットコインVIPクラブ",
        title_1: "VIPクラブに参加&",
        title_2: "限定特典をゲット",
        desc_part_1: "のメンバーになり、",
        desc_part_2: "忠実な顧客と暗号資産保有者のために予約された独占特典をお楽しみください。",
        feature_1_title: "5%キャッシュバックポイント",
        feature_1_desc: "サービスを利用するたびに、請求額の5％を会員アカウントに受け取ります。",
        feature_2_title: "誕生日ギフト",
        feature_2_desc: "誕生月にプレミアムスパペディキュアサービスが無料。",
        form: {
          title: "エリートクラブに参加",
          subtitle: "美容サービスの未来を解き放つ",
          name_label: "氏名",
          name_placeholder: "フルネームを入力",
          phone_label: "電話番号",
          phone_placeholder: "電話番号を入力",
          btn: "無料で登録",
          footer: "私たちは絶対的な情報セキュリティを約束します。"
        }
      },

      membership: {
        badge: "あなたのルック",
        title: "年間メンバーシップパッケージ",
        most_popular: "一番人気",
        save: "節約",
        entry_level: "エントリーレベル",
        period: "/年",
        valued_at: "相当額",
        plans: {
          silver: {
            name: "シルバー",
            subtitle: "エントリーレベル",
            button: "シルバーに参加",
            features: [
              "会員価格へのアクセス",
              "ビットコインで10%キャッシュバック",
              "ジェルオフ無料",
              "誕生日ギフト ($25)"
            ]
          },
          gold: {
            name: "ゴールド",
            subtitle: "ゴールド",
            button: "ゴールドに参加",
            features: [
              "月額 $50 クレジット",
              "サービスで10%キャッシュバック",
              "優先予約",
              "誕生日25%割引"
            ]
          },
          platinum: {
            name: "プラチナ",
            subtitle: "プラチナ",
            button: "プラチナに参加",
            features: [
              "月額 $60 クレジット",
              "サービスで15%キャッシュバック",
              "VIPラウンジアクセス",
              "プレミアムドリンク込み"
            ]
          },
          vip_crypto: {
            name: "VIP クリプト",
            subtitle: "VIP クリプト",
            button: "VIPに参加",
            features: [
              "月額 $80 クレジット",
              "20%キャッシュバック (ベストバリュー)",
              "オールインクルーシブ特典",
              "クリプト決済ボーナス"
            ]
          }
        }
      },
      
      why_exists: {
        title: "BITCOIN NAIL BAR™が存在する理由",
        subtitle_1: "美容業界は進化しています。",
        subtitle_2: "消費者は進化しています。",
        subtitle_3: "技術は進化しています。",
        lead: "Bitcoin Nail Bar™は新しい基準を設けるために作られました：",
        feature_1: "まれに見られるスケールのラグジュアリーネイルサロン",
        feature_2: "ブロックチェーン文化によって駆動される未来のブランド",
        feature_3_title: "暗号資産決済を受け入れる",
        feature_3_desc: "ビットコインと主要な代替通貨を使用した高速で安全な支払い。摩擦なし。",
        feature_4: "ビットコインという名前を誇り高く使用する最初のネイルサロン",
        feature_5: "美甲サロンが何であるかを再定義する10,000 SQFTのスペース",
        cta_line_1: "私たちは単にネイルサロンを開くだけでは��りません。",
        cta_line_2: "私たちはアイコンを構築しています。"
      },
      
      main_services: {
        title: "主要なサービス",
        subtitle: "私たちの包括的な高級ネイルケアサービスを探索してください",
        classic_manicure: "クラシックマニキュア",
        gel_manicure: "ジェルマニキュア",
        spa_pedicure: "スパペディキュア",
        nail_art: "ネイルアート",
        acrylic_nails: "アクリルネイル",
        nail_extensions: "ネイルエクステンション",
        view_all: "すべてのサービスを見る"
      }
    },
    coming_soon: {
      status: "進行中",
      title_1: "特別なもの",
      title_2: "が来ています",
      desc: "私たちは場所とレビューシステムのための革新的な体験を作成しています。高級美容テクノロジーの未来は待つ価値があります。",
      return_home: "ホームに戻る",
      book_now: "今すぐ予約"
    },
    booking_page: {
      subtitle: "サービスと希望の時間をお選びください。残りは私たちにお任せください！",
      back: "戻る",
      steps: {
        services: "サービスを選択",
        services_desc: "ご予約されたいサービスを1つ以上選択してください",
        time: "日時を選択",
        time_desc: "ご希望の予約時間を選択してください",
        technician: "技術者を選択",
        details: "あなたの詳細",
        details_desc: "連絡先情報をご入力ください",
        confirm: "確認"
      },
      technician: {
        desc: "お好みの専門家を選択してください",
        no_preference: "好みなし",
        no_preference_desc: "次に利用可能なシニア技術者を割り当てます"
      },
      form: {
        name: "フルネーム",
        phone: "電話番号",
        email: "メールアドレス",
        optional: "（オプション）",
        request: "特別なリクエスト（オプション）",
        notes: "備考",
        notes_placeholder: "特別なリクエストや備考...",
        confirm: "予約を確認",
        confirm_book: "予約を確認",
        continue: "続ける"
      },
      services: {
        loading: "サービス読み込み中...",
        all: "すべてのサービス",
        select_continue: "続けるにはサービスを選択してください",
        no_category: "このカテゴリにサービスが見つかりませんでした。",
        total_estimated: "予想合計："
      },
      time: {
        select_date: "日付を選択",
        select_time: "時間を選択",
        no_slots: "本日の利用可能な時間帯はありません。",
        choose_another_day: "別の日を選択してください。"
      },
      summary: {
        title: "予約概要",
        services: "サービス：",
        date: "日付：",
        time: "時間：",
        technician: "技術者：",
        total: "合計："
      },
      processing: "処理中...",
      errors: {
        required_fields: "すべての必須フィールドに入力してください",
        booking_failed: "予約に失敗しました。もう一度お試しください。",
        general: "エラーが発生しました。もう一度お試しください。"
      },
      success: "予約が確認されました！"
    },
    service_translations: {
      classic_manicure: {
        name: "クラシックマニキュア",
        description: "形成、研磨、甘皮ケア、塗装"
      },
      gel_manicure: {
        name: "ジェルマニキュア",
        description: "長持ちジェルポリッシュ"
      },
      spa_pedicure: {
        name: "スパペディキュア",
        description: "究極のフットケア体験"
      },
      nail_art_design: {
        name: "ネイルアートデザイン",
        description: "カスタム芸術デザイン"
      },
      acrylic_nails: {
        name: "アクリルネイル",
        description: "耐久性のあるアクリル延長"
      },
      nail_extensions: {
        name: "ネイルエクステンション",
        description: "美しい長さと形"
      },
      duration_unit: "分"
    },
    services_page: {
      hero_title: "ワールドクラス",
      hero_title_highlight: "サービス",
      hero_desc: "ビットコインにインスパイアされた当店のトリートメントで、ラグジュアリーの頂点を体験してください。",
      art_title: "芸術",
      art_highlight: "現代のネイルケア",
      art_desc: "ビットコインネイルバーでは、すべてのサービスが体験です。私たちは伝統的な技術と現代の技術を組み合わせて、精度、衛生、そして持続的な美しさを保証します。",
      premium_materials: "プレミアム素材",
      premium_desc: "有機的で無毒のポリッシュのみを使用しています。",
      menu_title: "私たちのメニュー",
      service_menu: {
        title: "サービスメニュー",
        subtitle: "包括的なケア",
        headers: {
          service: "サービス",
          regular: "通常",
          member: "メンバー"
        },
        categories: {
          acrylic: "アクリルネイルサービス",
          dipping: "ディッピングパウダー",
          gel: "ジェルシェラックサービス",
          waxing: "脱毛サービス",
          pedicure: "ペディキュア",
          manicure: "マニキュア",
          kids: "子供向けサービス",
          additional: "追加サービス"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "フルセット",
                items: [
                  { name: "アクリルとポリッシュ", regular: 45, member: 35 },
                  { name: "ホワイトまたはパールチップ", regular: 45, member: 35 },
                  { name: "ピンクパウダーのみ", regular: 45, member: 35 },
                  { name: "パウダー単色", regular: 45, member: 35 },
                  { name: "アクリルとシェラック", regular: 50, member: 40 },
                  { name: "ピンク&ホワイト", regular: 55, member: 45 },
                  { name: "オンブル2色", regular: 55, member: 45 },
                  { name: "オンブル3色", regular: 60, member: 50 }
                ]
              },
              {
                name: "アクリルネイルリフィル",
                items: [
                  { name: "同色リフィル", regular: 35, member: 30 },
                  { name: "カラーチェンジ", regular: 40, member: 33 },
                  { name: "アクリルリフィルとシェラック", regular: 45, member: 35 },
                  { name: "ピンク&ホワイトリフィル", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "ディッピングパウダー",
                items: [
                  { name: "ディップオーバーレイ", regular: 45, member: 40 },
                  { name: "ディップフルセット", regular: 50, member: 45 },
                  { name: "ディップピンク&ホワイト", regular: 55, member: 50 },
                  { name: "ディップオンブル", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "ジェルサービス",
                items: [
                  { name: "ジェルマニキュア", regular: 40, member: 35 },
                  { name: "ジェルペディキュア", regular: 50, member: 45 },
                  { name: "ジェルポリッシュチェンジ（手）", regular: 25, member: 20 },
                  { name: "ジェルポリッシュチェンジ（足）", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "顔",
                items: [
                  { name: "眉毛", regular: 15, member: 12 },
                  { name: "唇", regular: 10, member: 8 },
                  { name: "顎", regular: 12, member: 10 },
                  { name: "フルフェイス", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "ペディキュアトリートメント",
                items: [
                  { name: "クラシックペディキュア", regular: 35, member: 30 },
                  { name: "デラックスペディキュア", regular: 50, member: 45 },
                  { name: "ビットコインシグネチャーペディキュア", regular: 75, member: 65 },
                  { name: "ボルケーノスパペディキュア", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "マニキュアトリートメント",
                items: [
                  { name: "クラシックマニキュア", regular: 25, member: 20 },
                  { name: "デラックスマニキュア", regular: 35, member: 30 },
                  { name: "ビットコインシグネチャーマニキュア", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "キッズ向け（10歳以下）",
                items: [
                  { name: "マニキュア", regular: 15, member: 12 },
                  { name: "ペディキュア", regular: 25, member: 22 },
                  { name: "ポリッシュチェンジ（手）", regular: 10, member: 8 },
                  { name: "ポリッシュチェンジ（足）", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "追加オプション",
                items: [
                  { name: "ネイル修理", regular: 5, member: 0 },
                  { name: "ネイル除去", regular: 15, member: 10 },
                  { name: "パラフィンワックス", regular: 10, member: 8 },
                  { name: "角質除去", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "このカテゴリを予約",
      find_location: "最寄りの場所を探す",
      book_appointment: "ご予約",
      ready_title: "未来を体験する準備はできていますか？",
      ready_desc: "ビットコインネイルバーの基準に切り替えた何千人もの顧客に参加してください。",
      categories: {
        signature: {
          title: "シグネチャートリートメント",
          desc: "ビットコインにインスパイアされた当店のトリートメントで、ラグジュアリーの頂点を体験してください。",
          items: [
            { name: "ビットコインゴールドペディキュア", price: "$150", desc: "24Kゴールド浸漬、CBD注入、深層組織マッサージ。" },
            { name: "ダイヤモンドジェルマニキュア", price: "$85", desc: "本物のダイヤモンドダストの角質除去とプレミアムジェル仕上げ。" },
            { name: "クリプトグロウフェイシャル", price: "$120", desc: "有機酵素ピーリングと組み合わせたLED療法。" }
          ]
        },
        comprehensive: {
          title: "包括的なケア",
          desc: "必須のケアを高級基準に引き上げました。",
          items: [
            { name: "クラシックマニキュア", price: "$45", desc: "キューティクルケア、マッサージ、通常のポリッシュ。" },
            { name: "ジェルポリッシュ交換", price: "$35", desc: "プレミアムジェルカラーの除去と塗布。" },
            { name: "アクリルフルセット", price: "$75+", desc: "精密な成形による彫刻延長。" },
            { name: "ネイルアート", price: "$15+", desc: "カスタムデザイン、宝石、芸術的なネイル装飾。" }
          ]
        }
      }
    },
    footer: {
      desc: "未来的なひねりを加えたプレミアムネイルケアサービス。世界初の暗号統合高級サロン。",
      accept: "受け入れます",
      quick_links: "クイックリンク",
      popular_services: "人気のサービス",
      contact: "お問い合わせ",
      rights: "すべての権利予約済み。"
    },
    careers: {
      badge: "キャリアと機会",
      title: "エリートチームに参加",
      desc: "あなたのスキルを披露するための権威ある環境を探している才能あるネイル技術者または美容専門家ですか？ビットコインネイルバーは業界で最も競争力のある報酬パッケージを提供しています。",
      features: [
        "高いコミッション + 100％チップ",
        "モダンでハイテクな作業環境（10,000平方フィート）",
        "継続的なトレーニングとスキル開発",
        "柔軟なシフトとサポート的な管理"
      ],
      cta: "今日申し込む",
      salary_badge_title: "最高の給与",
      salary_badge_subtitle: "ヒューストンエリアで"
    },
    ready_cta: {
      instagram: "INSTAGRAMでフォロー",
      title: "あなたの外見を変える準備はできていますか？",
      desc: "今日予約して、高級ネイルケアの頂点を体験してください。美しく健康な爪への旅はここから始まります。",
      btn_book: "今すぐ予約",
      btn_explore: "サービスを探索"
    },
    egift: {
      badge: "完璧な贈り物",
      desc: "愛する人にリラクゼーションへのデジタルキーを贈りましょう。メール/SMSで即座にお届け。",
      send: "送信",
      luxury: "ラグジュアリー",
      instantly: "即座に",
      ai_messages: [
        "甘やかしと喜びに満ちたリラックスした一日になりますように！",
        "あなたにふさわしい贅沢を自分へのご褒美に。楽しんで！",
        "あなたの一日を明るくするためのささやかな贈り物。ご多幸をお祈りします！",
        "リラックス、リフレッシュ、リチャージ。あなたはそれに値します！",
        "愛と純粋な至福の瞬間を送ります。"
      ]
    }
  },

  de: {
    nav: {
      home: "Startseite",
      about_us: "Über Uns",
      services: "Dienstleistungen",
      promotions: "Aktionen",
      egift: "GESCHENKKARTE",
      membership: "Mitgliedschaft",
      careers: "Karriere",
      gallery: "Galerie",
      booking: "Termin buchen",
      staff: "Team",
      locations: "Standorte",
      reviews: "Bewertungen",
      contact: "Kontakt"
    },
    bottom_nav: {
      home: "Start",
      services: "Services",
      booking: "Buchen",
      membership: "Mitgliedschaft",
      egift: "E-Geschenk"
    },
    chatbot: {
      online: "Online",
      input_placeholder: "Nach Dienstleistungen fragen...",
      welcome: "Hallo! Willkommen in der Bitcoin Nail Bar. 💅✨ Ich kann Ihnen helfen, die perfekte Luxusbehandlung zu finden oder Ihren Termin zu buchen. Was kann ich heute für Sie tun?",
      error: "Ich habe gerade ein paar Probleme mit der Netzwerkverbindung. Bitte versuchen Sie es in einem Moment noch einmal!",
      bubbles: [
        "Hallo! Kann ich helfen? 👋",
        "Brauchen Sie Hilfe bei der Buchung? 💅",
        "Entdecken Sie unser Luxus-Spa! ✨",
        "Wir sind hier, um Ihnen zu helfen! 💬"
      ]
    },
    home: {
      badge: "DER ERSTE BITCOIN-NAGELSALON IN DEN USA",
      hero_unlock: "Freischalten",
      hero_vip_status: "VIP-Status",
      hero_get_rewards: "Belohnungen Erhalten",
      hero_desc_new_1: "Verbessern Sie Ihr Schönheitserlebnis mit unserem",
      hero_membership_program: "Mitgliedschaftsprogramm",
      hero_enjoy_up_to: "Genießen Sie bis zu",
      hero_cashback_20: "20% Cashback",
      hero_priority_access: "bevorzugte Buchung und exklusiven Zugang.",
      cta_view_packages: "PAKETE ANSEHEN",
      cta_design_card: "IHRE KARTE GESTALTEN",
      card_valid_thru: "GÜLTIG BIS",
      card_10_off: "10% RABATT",
      card_vip_membership: "VIP-MITGLIEDSCHAFT",
      card_cashback: "CASHBACK",
      hero_title_1: "Luxus",
      hero_title_2: "Schönheit",
      hero_title_3: "Innovation",
      hero_desc_1: "Wo High-End-Nagelkunst auf die Elite der",
      hero_desc_1_bold: "Krypto-Community trifft",
      hero_desc_2: "Erleben Sie den ersten",
      hero_desc_2_bold_1: "10.000 SQFT",
      hero_desc_2_part_2: "Raum in den USA, der",
      hero_desc_2_bold_2: "Krypto-Zahlungen akzeptiert",
      cta_book: "TERMIN BUCHEN",
      cta_vip: "VIP-CLUB BEITRETEN",

      features_section: {
        crypto_payments: {
          title: "Krypto-Zahlungen",
          subtitle: "Akzeptieren Bitcoin, USDT, VLINKPAY.",
          description: "Schnell & Absolut Sicher."
        },
        bar_cocktails: {
          title: "Bar & Cocktails",
          subtitle: "Genießen Sie kostenlose Getränke an unserer Luxus-Bar",
          description: "während Sie entspannen."
        },
        medical_hygiene: {
          title: "Medizinische Hygiene",
          subtitle: "Autoklav-Sterilisation in Krankenhausqualität",
          description: "Prozess. Sicherheit geht vor."
        },
        large_space: {
          title: "10.000+ SQF",
          subtitle: "Der größte Raum in Houston,",
          description: "entworfen für Privatsphäre und Klasse."
        }
      },
      
      bnb_section: {
        card_title: "Krypto-Networking",
        card_desc: "Jeden Sonntag in der Lounge",
        card_btn: "Mach mit",
        badge: "Zukunft der Schönheit",
        title_1: "Bitcoin Nail Bar",
        title_2: "Erste & Einzige",
        desc: "In der Bitcoin Nail Bar machen wir nicht nur Schönheit. Wir schaffen ein Ökosystem, in dem Kunst auf Technologie trifft. Das Bezahlen von Dienstleistungen mit Ihren Investitionsgewinnen war noch nie so stilvoll.",
        feature_1_title: "Krypto-Wissen",
        feature_1_desc: "Vernetzen Sie sich mit Experten, aktualisieren Sie Markttrends, während Sie Spa-Pediküre-Dienstleistungen genießen.",
        feature_2_title: "Zahlung 4.0",
        feature_2_desc: "Scannen Sie den QR-Code und zahlen Sie sofort mit Bitcoin, ETH, USDT oder VLinkPay-Wallet. Kein Bargeld, kein Ärger.",
        btn_register: "BEI VLINKPAY REGISTRIEREN"
      },
      
      about: {
        badge: "Über Uns",
        title: "Die erste Bitcoin-Marken-Luxus-Nagelbar der Welt",
        desc_1: "Bitcoin Nail Bar™ ist die allererste Beauty-Lounge der Welt, die unter der Marke Bitcoin gebaut wurde – und setzt einen neuen Standard durch die Verschmelzung von Luxus, Kunstfertigkeit und Blockchain-Technologie.",
        desc_2: "Auf über 10.000 SQFT ist unser Raum als High-End-Beauty-Erlebniszentrum konzipiert, in dem Kunden eine zukunftsweisende Umgebung betreten, die elegante Ästhetik mit der Freiheit moderner digitaler Zahlungen verbindet.",
        desc_3: "Hier trifft Schönheit auf Innovation. Kunden können erstklassige Nagelpflege, Spa-Dienstleistungen, Wimpern, Massagen und eine komplette Entspannungslounge genießen – alles aufgewertet durch ein futuristisches Design und nahtlose Krypto-Zahlungsoptionen.",
        
        vision: {
          title: "UNSERE VISION",
          desc: "Die globale Schönheitsindustrie neu definieren, indem wir die weltweit führende Beauty-Tech Nail Bar werden, wo:",
          items: [
            "Luxusästhetik auf modernste Blockchain trifft",
            "Krypto ein natürlicher Teil des täglichen Lebens wird",
            "Kunden ein intelligentes, sicheres und modernes Serviceerlebnis genießen",
            "Innovation die Art und Weise prägt, wie Schönheitsdienstleistungen in Zukunft funktionieren"
          ]
        },
        mission: {
          title: "UNSERE MISSION",
          items: [
             { title: "Krypto in die tägliche Schönheit bringen", desc: "Erster in den USA, der BTC, ETH, USDT, VMM, USDV akzeptiert. Krypto praktisch & zugänglich machen." },
             { title: "Luxuserlebnis im großen Maßstab", desc: "10.000 SQFT Lounge, Interieur im Resort-Stil und erstklassige Hygienestandards." },
             { title: "Zukunftsorientierte Community aufbauen", desc: "Verbindung von Pionieren, die Technologie und modernen Luxuslebensstil annehmen." },
             { title: "Profis stärken", desc: "Hervorragende Vergütung, Kompetenzentwicklung und ein respektvolles Berufsumfeld." }
          ]
        }
      },
      
      hygiene: {
        badge: "Gesundheit & Sicherheit zuerst",
        title: "Hygiene Nail Bar",
        desc: "Ihre Gesundheit und Sicherheit haben für uns oberste Priorität. Wir halten die höchsten Hygiene- und Desinfektionsstandards ein und übertreffen die Branchenvorschriften.",
        items: [
          "Autoklav-Sterilisation",
          "Einweg-Feilen & Puffer",
          "Medizinische Desinfektion",
          "Individuelle Werkzeugsets",
          "HEPA-Luftfilterung",
          "UV-Desinfektion",
          "Einweg-Liner",
          "Lizenzierte Techniker"
        ]
      },
      
      services: {
        badge: "Premium-Dienstleistungen",
        title: "Signature-Behandlungen",
        desc: "Erleben Sie die Konvergenz von Luxus und Technologie. Unsere Signature-Behandlungen enthalten wertvolle Elemente wie 24K Gold und Diamantstaub, direkt zahlbar mit Ihrer bevorzugten Kryptowährung.",
        items: [
          "Bitcoin Gold Pediküre",
          "Private VIP-Suiten",
          "Diamant-Gel-Maniküre",
          "Blockchain-verifizierte Produkte",
          "Krypto Glow Gesichtsbehandlung",
          "Sofortige Lightning-Zahlungen",
          "Tiefengewebe-Erholung",
          "Exklusive NFT-Mitgliedschaft"
        ],
        btn: "Menü erkunden"
      },
      promotions: {
        badge: "Zeitlich begrenzte Angebote",
        title: "Exklusive Werbeaktionen",
        card_1: {
          title: "20% RABATT",
          subtitle: "GROSSE ERÖFFNUNG",
          desc: "Feiern Sie unsere Eröffnung mit 20% Rabatt auf alle Dienstleistungen bei Ihrem ersten Besuch. Erleben Sie Luxus für weniger.",
          btn: "Jetzt Buchen"
        },
        card_2: {
          badge: "BELIEBT",
          title: "GRATIS",
          subtitle: "COCKTAILS & GETRÄNKE",
          desc: "Genießen Sie kostenlose Premium-Cocktails, Champagner oder Softdrinks bei jedem Service über 50$.",
          btn: "Menü Ansehen"
        },
        card_3: {
          title: "20$ GESCHENK",
          subtitle: "FREUND EMPFEHLEN",
          desc: "Bringen Sie einen Freund mit und Sie beide erhalten einen 20$-Gutschein für Ihren nächsten Besuch. Teilen ist Fürsorge!",
          btn: "Club Beitreten"
        }
      },
      vip_club: {
        badge: "Bitcoin VIP Club",
        title_1: "Treten Sie dem VIP Club bei &",
        title_2: "Erhalten Sie exklusive Belohnungen",
        desc_part_1: "Werden Sie Mitglied von",
        desc_part_2: "und genießen Sie exklusive Privilegien, die treuen Kunden und Krypto-Inhabern vorbehalten sind.",
        feature_1_title: "5% Cashback-Punkte",
        feature_1_desc: "Erhalten Sie 5% des Rechnungswerts auf Ihr Mitgliedskonto bei jeder Servicenutzung.",
        feature_2_title: "Geburtstagsgeschenke",
        feature_2_desc: "Kostenloser Premium Spa Pediküre-Service während Ihres Geburtsmonats.",
        form: {
          title: "Elite Club Beitreten",
          subtitle: "Entsperren Sie die Zukunft der Schönheitsdienstleistungen",
          name_label: "Vollständiger Name",
          name_placeholder: "Geben Sie Ihren vollständigen Namen ein",
          phone_label: "Telefonnummer",
          phone_placeholder: "Telefonnummer eingeben",
          btn: "Kostenlos Registrieren",
          footer: "Wir verpflichten uns zur absoluten Informationssicherheit."
        }
      },

      membership: {
        badge: "IHR LOOK",
        title: "Jährliche Mitgliedschaftspakete",
        most_popular: "BELIEBTESTE",
        save: "SPAREN",
        entry_level: "EINSTIEGSLEVEL",
        period: "/jahr",
        valued_at: "WERT VON",
        plans: {
          silver: {
            name: "SILBER",
            subtitle: "EINSTIEGSLEVEL",
            button: "SILBER BEITRETEN",
            features: [
              "Zugang zu Mitgliederpreisen",
              "10% Cashback in Bitcoin",
              "Kostenlose Gel-Entfernung",
              "Geburtstagsgeschenk ($25)"
            ]
          },
          gold: {
            name: "GOLD",
            subtitle: "GOLD",
            button: "GOLD BEITRETEN",
            features: [
              "$50 Monatliches Guthaben",
              "10% Cashback auf Services",
              "Bevorzugte Buchung",
              "25% Rabatt am Geburtstag"
            ]
          },
          platinum: {
            name: "PLATIN",
            subtitle: "PLATIN",
            button: "PLATIN BEITRETEN",
            features: [
              "$60 Monatliches Guthaben",
              "15% Cashback auf Services",
              "VIP-Lounge-Zugang",
              "Premium-Getränke Inklusive"
            ]
          },
          vip_crypto: {
            name: "VIP CRYPTO",
            subtitle: "VIP CRYPTO",
            button: "VIP BEITRETEN",
            features: [
              "$80 Monatliches Guthaben",
              "20% Cashback (Bester Wert)",
              "All-Inclusive-Vorteile",
              "Krypto-Zahlungsbonus"
            ]
          }
        }
      },
      
      why_exists: {
        title: "WARUM BITCOIN NAIL BAR™ EXISTIERT",
        subtitle_1: "Die Schönheitsindustrie entwickelt sich.",
        subtitle_2: "Kunden entwickeln sich.",
        subtitle_3: "Technologie entwickelt sich.",
        lead: "Bitcoin Nail Bar™ wurde geschaffen, um einen neuen Standard zu setzen:",
        feature_1: "Ein Luxus-Nagel-Salon auf einer selten gesehene Skala",
        feature_2: "Eine futuristische Marke, die von Blockchain-Kultur getrieben wird",
        feature_3_title: "Kryptozahlungen akzeptiert",
        feature_3_desc: "Schnelle, sichere Zahlungen mit Bitcoin & Hauptalternativen. Keine Friction.",
        feature_4: "Der erste Nagel-Salon, der den Namen Bitcoin stolz trägt",
        feature_5: "Ein 10.000 SQFT Raum, der neu definiert, was ein Nagel-Salon sein kann",
        cta_line_1: "Wir öffnen nicht nur einen Nagel-Salon.",
        cta_line_2: "Wir bauen ein Symbol."
      },
      
      main_services: {
        title: "Hauptdienstleistungen",
        subtitle: "Entdecken Sie unsere umfassende Palette an Premium-Nagelpflegedienstleistungen",
        classic_manicure: "Klassische Maniküre",
        gel_manicure: "Gel-Maniküre",
        spa_pedicure: "Spa-Pedicüre",
        nail_art: "Nagelkunst",
        acrylic_nails: "Acrylnägel",
        nail_extensions: "Nagelverlängerungen",
        view_all: "Alle Dienstleistungen anzeigen"
      }
    },
    coming_soon: {
      status: "In Bearbeitung",
      title_1: "Etwas Außergewöhnliches",
      title_2: "Kommt",
      desc: "Wir schaffen ein revolutionäres Erlebnis für unser Standort- und Bewertungssystem. Die Zukunft der Luxus-Beauty-Technologie ist das Warten wert.",
      return_home: "Zurück zur Startseite",
      book_now: "Jetzt Buchen"
    },
    booking_page: {
      subtitle: "Wählen Sie Ihre Dienstleistungen und bevorzugte Zeit. Wir kümmern uns um den Rest!",
      back: "Zurück",
      steps: {
        services: "Dienstleistungen Auswählen",
        services_desc: "Wählen Sie eine oder mehrere Dienstleistungen, die Sie buchen möchten",
        time: "Datum & Uhrzeit Auswählen",
        time_desc: "Wählen Sie Ihre bevorzugte Terminzeit",
        technician: "Techniker Auswählen",
        details: "Ihre Angaben",
        details_desc: "Bitte geben Sie Ihre Kontaktdaten an",
        confirm: "Bestätigung"
      },
      technician: {
        desc: "Wählen Sie Ihren bevorzugten Experten",
        no_preference: "Keine Präferenz",
        no_preference_desc: "Wir werden den nächsten verfügbaren Senior-Techniker zuweisen"
      },
      form: {
        name: "Vollständiger Name",
        phone: "Telefonnummer",
        email: "E-Mail-Adresse",
        optional: "(Optional)",
        request: "Besondere Wünsche (Optional)",
        notes: "Anmerkungen",
        notes_placeholder: "Besondere Wünsche oder Anmerkungen...",
        confirm: "Buchung Bestätigen",
        confirm_book: "Buchung Bestätigen",
        continue: "Weiter"
      },
      services: {
        loading: "Dienstleistungen werden geladen...",
        all: "Alle Dienstleistungen",
        select_continue: "Wählen Sie eine Dienstleistung zum Fortfahren",
        no_category: "Keine Dienstleistungen in dieser Kategorie gefunden.",
        total_estimated: "Geschätzte Gesamtsumme:"
      },
      time: {
        select_date: "Datum Auswählen",
        select_time: "Uhrzeit Auswählen",
        no_slots: "Keine verfügbaren Zeitfenster für heute.",
        choose_another_day: "Bitte wählen Sie einen anderen Tag."
      },
      summary: {
        title: "Buchungsübersicht",
        services: "Dienstleistungen:",
        date: "Datum:",
        time: "Uhrzeit:",
        technician: "Techniker:",
        total: "Gesamt:"
      },
      processing: "Wird verarbeitet...",
      errors: {
        required_fields: "Bitte füllen Sie alle erforderlichen Felder aus",
        booking_failed: "Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        general: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      },
      success: "Buchung Bestätigt!"
    },
    service_translations: {
      classic_manicure: {
        name: "Klassische Maniküre",
        description: "Formen, Polieren, Nagelhautpflege und Lack"
      },
      gel_manicure: {
        name: "Gel-Maniküre",
        description: "Langanhaltender Gel-Lack"
      },
      spa_pedicure: {
        name: "Spa-Pedicüre",
        description: "Ultimatives Fußpflegeerlebnis"
      },
      nail_art_design: {
        name: "Nagelkunst-Design",
        description: "Maßgeschneiderte künstlerische Designs"
      },
      acrylic_nails: {
        name: "Acrylnägel",
        description: "Langlebige Acryl-Verlängerungen"
      },
      nail_extensions: {
        name: "Nagelverlängerungen",
        description: "Schöne Länge und Form"
      },
      duration_unit: "Min"
    },
    services_page: {
      hero_title: "Weltklasse",
      hero_title_highlight: "Dienstleistungen",
      hero_desc: "Erleben Sie den Gipfel des Luxus mit unseren Bitcoin-inspirierten Behandlungen.",
      art_title: "Die Kunst der",
      art_highlight: "Modernen Nagelpflege",
      art_desc: "Bei Bitcoin Nail Bar ist jede Dienstleistung ein Erlebnis. Wir kombinieren traditionelle Techniken mit moderner Technologie, um Präzision, Hygiene und dauerhafte Schönheit zu gewährleisten.",
      premium_materials: "Premium-Materialien",
      premium_desc: "Wir verwenden nur organische, ungiftige Lacke.",
      menu_title: "Unser Menü",
      service_menu: {
        title: "Dienstleistungsmenü",
        subtitle: "Umfassende Pflege",
        headers: {
          service: "Dienstleistung",
          regular: "Regulär",
          member: "Mitglied"
        },
        categories: {
          acrylic: "Acrylnagel-Dienstleistungen",
          dipping: "Tauchpulver",
          gel: "Gel-Shellac-Service",
          waxing: "Wachsdienstleistungen",
          pedicure: "Pediküre",
          manicure: "Maniküre",
          kids: "Kinder-Dienstleistungen",
          additional: "Zusätzliche Dienstleistungen"
        },
        data: {
          acrylic: {
            groups: [
              {
                name: "VOLLSTÄNDIGES SET",
                items: [
                  { name: "Acryl mit Lack", regular: 45, member: 35 },
                  { name: "Weiße oder Perlenspitze", regular: 45, member: 35 },
                  { name: "Nur rosa Pulver", regular: 45, member: 35 },
                  { name: "Pulver Vollfarbe", regular: 45, member: 35 },
                  { name: "Acryl mit Shellac", regular: 50, member: 40 },
                  { name: "Rosa & Weiß", regular: 55, member: 45 },
                  { name: "Ombre 2 Farben", regular: 55, member: 45 },
                  { name: "Ombre 3 Farben", regular: 60, member: 50 }
                ]
              },
              {
                name: "ACRYLNAGEL-AUFFÜLLUNG",
                items: [
                  { name: "Auffüllen gleiche Farbe", regular: 35, member: 30 },
                  { name: "Farbe wechseln", regular: 40, member: 33 },
                  { name: "Acryl-Auffüllung mit Shellac", regular: 45, member: 35 },
                  { name: "Rosa & Weiß Auffüllung", regular: 45, member: 35 }
                ]
              }
            ]
          },
          dipping: {
            groups: [
              {
                name: "TAUCHPULVER",
                items: [
                  { name: "Tauch-Overlay", regular: 45, member: 40 },
                  { name: "Tauch-Vollset", regular: 50, member: 45 },
                  { name: "Tauch Rosa & Weiß", regular: 55, member: 50 },
                  { name: "Tauch Ombre", regular: 60, member: 55 }
                ]
              }
            ]
          },
          gel: {
            groups: [
              {
                name: "GEL-DIENSTLEISTUNGEN",
                items: [
                  { name: "Gel-Maniküre", regular: 40, member: 35 },
                  { name: "Gel-Pediküre", regular: 50, member: 45 },
                  { name: "Gel-Lackwechsel (Hände)", regular: 25, member: 20 },
                  { name: "Gel-Lackwechsel (Füße)", regular: 30, member: 25 }
                ]
              }
            ]
          },
          waxing: {
            groups: [
              {
                name: "GESICHT",
                items: [
                  { name: "Augenbrauen", regular: 15, member: 12 },
                  { name: "Lippe", regular: 10, member: 8 },
                  { name: "Kinn", regular: 12, member: 10 },
                  { name: "Volles Gesicht", regular: 45, member: 40 }
                ]
              }
            ]
          },
          pedicure: {
            groups: [
              {
                name: "PEDIKÜRE-BEHANDLUNGEN",
                items: [
                  { name: "Klassische Pediküre", regular: 35, member: 30 },
                  { name: "Luxus-Pediküre", regular: 50, member: 45 },
                  { name: "Bitcoin Signature Pediküre", regular: 75, member: 65 },
                  { name: "Vulkan-Spa Pediküre", regular: 65, member: 55 }
                ]
              }
            ]
          },
          manicure: {
            groups: [
              {
                name: "MANIKÜRE-BEHANDLUNGEN",
                items: [
                  { name: "Klassische Maniküre", regular: 25, member: 20 },
                  { name: "Luxus-Maniküre", regular: 35, member: 30 },
                  { name: "Bitcoin Signature Maniküre", regular: 50, member: 45 }
                ]
              }
            ]
          },
          kids: {
            groups: [
              {
                name: "FÜR KINDER (Unter 10)",
                items: [
                  { name: "Maniküre", regular: 15, member: 12 },
                  { name: "Pediküre", regular: 25, member: 22 },
                  { name: "Lackwechsel (Hände)", regular: 10, member: 8 },
                  { name: "Lackwechsel (Füße)", regular: 12, member: 10 }
                ]
              }
            ]
          },
          additional: {
            groups: [
              {
                name: "ZUSATZLEISTUNGEN",
                items: [
                  { name: "Nagelreparatur", regular: 5, member: 0 },
                  { name: "Nagelentfernung", regular: 15, member: 10 },
                  { name: "Paraffinwachs", regular: 10, member: 8 },
                  { name: "Hornhautentfernung", regular: 8, member: 5 }
                ]
              }
            ]
          }
        }
      },
      book_category: "Diese Kategorie Buchen",
      find_location: "Nächsten Standort Finden",
      book_appointment: "Ihren Termin Buchen",
      ready_title: "Bereit, die Zukunft zu Erleben?",
      ready_desc: "Schließen Sie sich den Tausenden von Kunden an, die zum Bitcoin Nail Bar-Standard gewechselt sind.",
      categories: {
        signature: {
          title: "Signature-Behandlungen",
          desc: "Erleben Sie den Gipfel des Luxus mit unseren Bitcoin-inspirierten Behandlungen.",
          items: [
            { name: "Bitcoin Gold Pediküre", price: "$150", desc: "24K Gold-Einweichen, CBD-Infusion, Tiefengewebsmassage." },
            { name: "Diamant-Gel-Maniküre", price: "$85", desc: "Echte Diamantstaubpeeling mit Premium-Gel-Finish." },
            { name: "Krypto Glow Gesichtsbehandlung", price: "$120", desc: "LED-Therapie kombiniert mit organischem Enzym-Peeling." }
          ]
        },
        comprehensive: {
          title: "Umfassende Pflege",
          desc: "Wesentliche Pflege auf einen Luxusstandard gehoben.",
          items: [
            { name: "Klassische Maniküre", price: "$45", desc: "Nagelhautpflege, Massage und normaler Lack." },
            { name: "Gel-Lackwechsel", price: "$35", desc: "Entfernung und Auftragen von Premium-Gelfarbe." },
            { name: "Acryl-Vollsatz", price: "$75+", desc: "Skulptierte Verlängerungen mit Präzisionsformung." },
            { name: "Nagelkunst", price: "$15+", desc: "Individuelle Designs, Edelsteine und künstlerische Nagelverzierungen." }
          ]
        }
      }
    },
    footer: {
      desc: "Premium-Nagelpflegedienste mit futuristischem Touch. Der weltweit erste Krypto-integrierte Luxussalon.",
      accept: "Wir Akzeptieren",
      quick_links: "Schnelllinks",
      popular_services: "Beliebte Dienstleistungen",
      contact: "Kontaktieren Sie Uns",
      rights: "Alle Rechte vorbehalten."
    },
    careers: {
      badge: "KARRIEREN & MÖGLICHKEITEN",
      title: "Treten Sie dem Elite-Team bei",
      desc: "Sind Sie ein talentierter Nageltech oder Beauty-Experte auf der Suche nach einer renommierten Umgebung, um Ihre Fähigkeiten zu präsentieren? Bitcoin Nail Bar bietet das wettbewerbsfähigste Vergütungspaket der Branche.",
      features: [
        "Hohe Provision + 100% Trinkgeld",
        "Moderne, hochtechnologische Arbeitsumgebung (10.000 SQFT)",
        "Kontinuierliche Schulung & Kompetenzentwicklung",
        "Flexible Schichten & unterstützende Verwaltung"
      ],
      cta: "HEUTE BEWERBEN",
      salary_badge_title: "Höchste Bezahlung",
      salary_badge_subtitle: "IM HOUSTON-GEBIET"
    },
    ready_cta: {
      instagram: "FOLGEN SIE UNS AUF INSTAGRAM",
      title: "Bereit, Ihr Aussehen zu Verwandeln?",
      desc: "Buchen Sie heute Ihren Termin und erleben Sie den Gipfel der Luxus-Nagelpflege. Ihre Reise zu schönen, gesunden Nägeln beginnt hier.",
      btn_book: "Jetzt Termin Buchen",
      btn_explore: "Dienstleistungen Erkunden"
    },
    egift: {
      badge: "DAS PERFEKTE GESCHENK",
      desc: "Überraschen Sie Ihre Liebsten mit einem digitalen Schlüssel zur Entspannung. Sofort per E-Mail/SMS geliefert.",
      send: "Senden",
      luxury: "LUXUS",
      instantly: "Sofort",
      ai_messages: [
        "Ich wünsche dir einen entspannten Tag voller Verwöhnung und Freude!",
        "Gönnen Sie sich den Luxus, den Sie verdienen. Genießen Sie es!",
        "Eine Kleinigkeit, um Ihren Tag zu verschönern. Die besten Wünsche!",
        "Entspannen, erfrischen und auftanken. Du hast es dir verdient!",
        "Sende dir Liebe und einen Moment puren Glücks."
      ]
    }
  }
};