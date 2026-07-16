"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Download, Calendar, Mail, FileText, UserCheck, ShieldAlert, Award, ArrowUpRight } from "lucide-react";

export default function AboutAuthor() {
  
  const timelineEvents = [
    {
      year: "2017",
      title: "Vedic Foundations",
      desc: "Began deep scholarly study of the Prasthanatrayi (Upanishads, Brahma Sutras, and Bhagavad Gita) under traditional Sanskrit tutors in India."
    },
    {
      year: "2019",
      title: "Synthesis of Therapy & Wisdom",
      desc: "Founded a private counseling practice. Integrated Cognitive Behavioral Therapy (CBT) frameworks with Eastern mindfulness and Karma Yoga approaches."
    },
    {
      year: "2021",
      title: "The Book Concept",
      desc: "Started structuring drafts for *The Unshaken Self*, conducting qualitative interviews with over 200 corporate executives suffering from severe work fatigue."
    },
    {
      year: "2024",
      title: "Researching about the book",
      desc: "Dedicated the year to deep scriptural research, cross-referencing Vedic psychology elements, and structuring the core chapters."
    },
    {
      year: "2026",
      title: "Launch of The Unshaken Self",
      desc: "Finalized publishers and designed global launch operations targeting Krishna Janmashtami 2026."
    }
  ];

  const speakingTopics = [
    {
      title: "Karma Yoga in the Corporate Arena",
      desc: "How professionals can execute at the highest levels, launch products, and manage teams without developing chronic performance anxiety."
    },
    {
      title: "The Sthitaprajna Framework",
      desc: "Drawing from Gita Chapter 2 to build a mind that is neither overly elated by success nor crushed by failures."
    },
    {
      title: "Ancient Mindfulness vs. Modern App-based Meditation",
      desc: "Moving beyond passive breathing exercises to active, cognitive meditation systems outlined in Vedic literature."
    }
  ];

  const mediaKitAssets = [
    { name: "High-Res Author Portrait", type: "ZIP (JPG)", size: "79 KB", file: "/media-kit/High-Res_Author_Portraits.zip" },
    { name: "Book Cover Graphic Kit", type: "ZIP (JPG, 4 Files)", size: "3.0 MB", file: "/media-kit/Book_Cover_Graphic_Kit.zip" },
    { name: "Official Launch Press Release", type: "PDF Document", size: "4 KB", file: "/media-kit/Official_Launch_Press_Release.pdf" },
    { name: "Author Full & Short Biographies", type: "PDF Document", size: "6 KB", file: "/media-kit/Author_Full_and_Short_Biographies.pdf" }
  ];

  return (
    <div className="flex-1 flex flex-col pt-16 bg-[#faf8f5] dark:bg-[#070b09]">
      <Navbar />

      {/* Page Header */}
      <header className="py-20 px-4 text-center border-b border-border-custom bg-white dark:bg-[#050806] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(223,177,91,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-[0.3em] text-[#b5924b] dark:text-[#dfb15b] uppercase font-bold">
            The Author's Path
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
            About KETUL SHAH
          </h1>
          <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Spiritual researcher, counselor, and writer focused on translating ancient wisdom into modern mental blueprints.
          </p>
        </div>
      </header>

      {/* Main Bio / Vision Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">Bridging Scriptural Study & Modern Psychology</h2>
              <div className="w-16 h-[2px] bg-[#dfb15b]" />
            </div>

            <div className="space-y-6 text-stone-600 dark:text-stone-300 font-light text-xs sm:text-sm leading-relaxed text-justify">
              <p>
                <strong>KETUL SHAH</strong> bridges the high-stakes reality of the modern corporate world with the profound, quiet depths of ancient spiritual wisdom. For the past twenty years, he has built a highly successful career in the fast-paced, demanding Information Technology (IT) industry. Those who cross his path quickly recognise that his most defining achievement is not his extensive professional resume, but the unshakeable inner peace he maintains amidst the constant pressures of corporate life. He is the living embodiment of the principles shared in <em>The Unshaken Self</em>—a modern professional navigating the complexities of the world with a calm, worry-free mind.
              </p>
              <p>
                Beyond the boardroom, Ketul is a dedicated student of life and a passionate explorer of Sanatan history. He has spent years diving deeply into the timeless teachings of the Bhagavad Gita, seeking to decode its ancient verses into practical, everyday keys for human happiness. For Ketul, the Gita is not merely a philosophical or historical text; it is a vital, living manual for understanding the immense power of the human mind. By actively applying these foundational principles to his own life, he has mastered the art of fine-tuning his consciousness to live free of tension—a state of being he passionately believes is accessible to everyone.
              </p>
              <p>
                This pursuit of harmony extends far beyond his spiritual studies into a rich, vibrant creative life. Ketul is an accomplished polymath with a profound love for the arts. He is a dedicated musician who explores a multitude of genres and plays more than twelve different instruments, finding deep joy and presence in creating and regenerating music.
              </p>
              <p>
                This same creative devotion is mirrored in his culinary arts. In the kitchen, Ketul is an award-winning innovator, celebrated for his unique fusion cuisines and his ability to balance complex flavours. His culinary artistry has earned him prestigious accolades, including the <em>"Hyper Budding Chef"</em> and <em>"Creative Chef"</em> awards. Whether he is tuning an instrument or crafting a new dish, he approaches his passions with the same total presence and devotion that he applies to his spiritual life.
              </p>
              <p>
                At the very core of Ketul's existence is a philosophy of total surrender and trust. He navigates his journey by simply moving with the flow of life, accepting whatever the universe presents without doubt, question, or anxiety. He holds a quiet, unbreakable belief that the universe is inherently benevolent—always working in his favour and constantly guiding him closer to the manifestation of his deepest desires and dreams.
              </p>
            </div>

            {/* Mission / Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-6 border border-border-custom bg-white dark:bg-[#101614] rounded-2xl space-y-3">
                <h4 className="font-serif text-sm text-[#dfb15b] font-semibold">The Mission</h4>
                <p className="text-xs font-light text-stone-500 leading-relaxed">
                  To democratize ancient Vedic psychology, making it practical and actionable for high-pressure modern careers.
                </p>
              </div>
              <div className="p-6 border border-border-custom bg-white dark:bg-[#101614] rounded-2xl space-y-3">
                <h4 className="font-serif text-sm text-[#dfb15b] font-semibold">The Vision</h4>
                <p className="text-xs font-light text-stone-500 leading-relaxed">
                  A society where professional excellence and deep internal peace co-exist, built upon stable self-knowledge.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Mini Portrait & Direct Contacts */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-border-custom rounded-2xl bg-white dark:bg-[#101614] p-6 space-y-6">
              {/* Author Portrait */}
              <div className="aspect-[3/4] max-w-sm mx-auto rounded-xl border border-border-custom relative overflow-hidden bg-stone-100 dark:bg-[#0b100e]">
                <Image
                  src="/images/ketul-shah-author.jpg"
                  alt="Ketul Shah, author of The Unshaken Self"
                  fill
                  sizes="(max-width: 1024px) 100vw, 384px"
                  className="object-cover object-top"
                  priority
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-serif text-base text-foreground font-semibold">Speaking & Media Inquiry</h3>
                <p className="text-xs font-light text-stone-500 leading-relaxed">
                  Ketul Shah regularly accepts speaking invitations for podcasts, keynote panels, and virtual corporate workshops.
                </p>
                <div className="space-y-3 pt-2">
                  <a
                    href="mailto:ketu001in@gmail.com"
                    className="flex items-center space-x-3 text-xs text-[#b5924b] dark:text-[#dfb15b] hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    <span>ketu001in@gmail.com</span>
                  </a>
                  <a
                    href="https://instagram.com/TheUnshakenselfbyketulshah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-xs text-[#b5924b] dark:text-[#dfb15b] hover:underline"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                    <span>Instagram: @TheUnshakenselfbyketulshah</span>
                  </a>
                  <div className="flex items-center space-x-3 text-xs text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span>Booking Availability: Q3/Q4 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive timeline of events */}
      <section className="py-20 px-4 bg-white dark:bg-[#050806] border-y border-border-custom">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Research & Action
            </h2>
            <h3 className="text-3xl font-serif text-foreground">
              Professional Timeline
            </h3>
          </div>

          <div className="relative border-l border-border-custom ml-4 md:ml-32 space-y-12">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12 group">
                {/* Year tag for desktop */}
                <div className="hidden md:block absolute -left-36 top-1.5 w-28 text-right font-mono text-xs uppercase tracking-widest text-[#dfb15b] font-bold">
                  {event.year}
                </div>
                
                {/* Tiny timeline circle indicator */}
                <div className="absolute -left-[5px] top-2.5 w-2.5 h-2.5 rounded-full bg-border-custom group-hover:bg-[#dfb15b] group-hover:scale-125 transition-all duration-300" />
                
                <div className="space-y-2">
                  {/* Year tag for mobile */}
                  <span className="inline-block md:hidden font-mono text-[10px] tracking-widest text-[#dfb15b] font-bold mb-1">
                    {event.year}
                  </span>
                  <h4 className="font-serif text-base text-foreground font-semibold">
                    {event.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
                    {event.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speaking Topics Column */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Speaking Engagements
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
              Signature Keynote Themes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {speakingTopics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#101614] border border-border-custom p-8 rounded-2xl space-y-4 hover:shadow-md transition-shadow text-center md:text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#dfb15b]/10 text-[#dfb15b] flex items-center justify-center mx-auto md:mx-0">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base text-foreground tracking-wide font-semibold">
                  {topic.title}
                </h4>
                <p className="text-xs sm:text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed">
                  {topic.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit Download Panel */}
      <section id="media-kit" className="py-20 px-4 bg-[#faf8f5] dark:bg-[#050806] border-t border-border-custom scroll-mt-20 flex justify-center">
        <div className="max-w-4xl w-full glassmorphism border border-border-custom rounded-3xl p-8 md:p-12 space-y-10 shadow-lg">
          <div className="text-center md:text-left space-y-3">
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#b5924b] dark:text-[#dfb15b] font-semibold">
              Press Relations
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif text-foreground">
              Official Media Kit
            </h3>
            <p className="text-xs font-light text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed">
              Journalists, podcast hosts, and event organizers can access high-resolution assets, official bios, and book layouts for publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaKitAssets.map((asset, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#101614] p-5 border border-border-custom rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-1.5 pr-4">
                  <h4 className="font-serif text-sm text-foreground font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#dfb15b]" />
                    <span>{asset.name}</span>
                  </h4>
                  <p className="text-[10px] text-muted-text font-mono uppercase">
                    {asset.type} • {asset.size}
                  </p>
                </div>
                <a
                  href={asset.file}
                  download
                  className="p-2.5 rounded-full border border-border-custom hover:border-[#dfb15b] hover:text-[#dfb15b] transition-all cursor-pointer text-muted-text"
                  aria-label={`Download ${asset.name}`}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border-custom/50 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-text gap-4">
            <span>Need customized interview responses or custom sizes?</span>
            <a
              href="mailto:ketu001in@gmail.com"
              className="inline-flex items-center space-x-1 text-[#dfb15b] font-semibold hover:underline"
            >
              <span>Contact Press Relations</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <AIChatbot />
      <Footer />
    </div>
  );
}
