"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDashboard = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const features = [
    {
      icon: '🖼️',
      title: 'Images & Graphics',
      desc: 'Professional quality backgrounds, templates aur designs'
    },
    {
      icon: '🎬',
      title: 'Videos & Effects',
      desc: 'Premium video templates, transitions aur editing assets'
    },
    {
      icon: '📱',
      title: 'APKs & Apps',
      desc: 'Mod apps, pro versions aur exclusive tools'
    },
    {
      icon: '💻',
      title: 'Code & Dev',
      desc: 'Ready-to-use code snippets aur development resources'
    }
  ];

  const benefits = [
    {
      emoji: '⚡',
      title: 'Lightning Fast',
      desc: 'Direct downloads - koi ads wait nahi'
    },
    {
      emoji: '🔒',
      title: 'Secure & Private',
      desc: 'Apka data safe aur secure hai'
    },
    {
      emoji: '💰',
      title: 'Bilkul Free',
      desc: 'Sab resources free download kar sakte ho'
    },
    {
      emoji: '🎁',
      title: 'Regular Updates',
      desc: 'Har hafte naye content add hota hai'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Account Banao',
      desc: '2 minuto mein quick signup karo'
    },
    {
      num: '02',
      title: 'Browse & Download',
      desc: 'Apne pasand ka content dhoondhdo'
    },
    {
      num: '03',
      title: 'Use & Enjoy',
      desc: 'Apne projects mein use karo'
    },
    {
      num: '04',
      title: 'Share & Earn',
      desc: 'Content upload karo aur passive income banaao'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>⚡ GetUniqueVault</div>
          <div className={styles.navButtons}>
            {!authChecking && (
              <>
                {user ? (
                  <button 
                    className={styles.navBtn + ' ' + styles.active}
                    onClick={() => router.push('/dashboard')}
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button 
                      className={styles.navBtn}
                      onClick={() => router.push('/login')}
                    >
                      Login
                    </button>
                    <button 
                      className={styles.navBtn + ' ' + styles.active}
                      onClick={() => router.push('/signup')}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent + ' ' + styles.fadeIn}>
          <h1 className={styles.heroTitle + ' ' + styles.slideUp}>
            Free Digital Assets
            <span className={styles.highlight}> For Creators</span>
          </h1>
          <p className={styles.heroSubtitle + ' ' + styles.slideUp}>
            Images, videos, APKs, templates aur 1000+ resources
            <br />
            Bilkul FREE - Koi hidden charges nahi! 🎁
          </p>
          <div className={styles.heroCTA + ' ' + styles.slideUp}>
            <button 
              className={styles.ctaPrimary}
              onClick={() => router.push('/signup')}
            >
              Account Banao - Ab Hi! 🚀
            </button>
            <button 
              className={styles.ctaSecondary}
              onClick={handleDashboard}
            >
              Browse Content →
            </button>
          </div>
          <div className={styles.heroStats + ' ' + styles.slideUp}>
            <div className={styles.stat}>
              <span className={styles.statNum}>1000+</span>
              <span className={styles.statLabel}>Assets</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>50K+</span>
              <span className={styles.statLabel}>Downloads</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Kya Mil Sakta Hai? 📦</h2>
          <p>Creators ke liye sab kuch ek jagah par</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className={styles.featureCard + ' ' + styles.slideUp}
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <a href="/browse" className={styles.featureLink}>
                Explore →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.sectionHeader}>
          <h2>Kyun GetUniqueVault? 🌟</h2>
          <p>Ye sab features sirf yahi par milenge</p>
        </div>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, idx) => (
            <div 
              key={idx}
              className={styles.benefitCard + ' ' + styles.slideUp}
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <div className={styles.benefitEmoji}>{benefit.emoji}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>3 Steps Mein Shuru Karo 🎯</h2>
          <p>Bilkul simple process - 2 minuto mein!</p>
        </div>
        <div className={styles.stepsContainer}>
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={styles.step + ' ' + styles.slideUp}
              style={{ animationDelay: `${0.15 * (idx + 1)}s` }}
            >
              <div className={styles.stepNum}>{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {idx < steps.length - 1 && <div className={styles.stepArrow}>↓</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <h2>Top Categories 🎨</h2>
          <p>Browse by type aur find exact jo chahiye</p>
        </div>
        <div className={styles.categoryGrid}>
          <div className={styles.categoryCard + ' ' + styles.slideUp} style={{ animationDelay: '0.1s' }}>
            <div className={styles.categoryIcon}>🖼️</div>
            <h3>Images</h3>
            <p>1000+ backgrounds & designs</p>
          </div>
          <div className={styles.categoryCard + ' ' + styles.slideUp} style={{ animationDelay: '0.2s' }}>
            <div className={styles.categoryIcon}>🎬</div>
            <h3>Videos</h3>
            <p>500+ video templates & effects</p>
          </div>
          <div className={styles.categoryCard + ' ' + styles.slideUp} style={{ animationDelay: '0.3s' }}>
            <div className={styles.categoryIcon}>📱</div>
            <h3>APKs</h3>
            <p>300+ mod & pro apps</p>
          </div>
          <div className={styles.categoryCard + ' ' + styles.slideUp} style={{ animationDelay: '0.4s' }}>
            <div className={styles.categoryIcon}>💻</div>
            <h3>Code</h3>
            <p>100+ code snippets & resources</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent + ' ' + styles.slideUp}>
          <h2>Abhi Join Karo! 🎉</h2>
          <p>1000+ creators pehle se use kar rahe hain GetUniqueVault</p>
          <button 
            className={styles.ctaBig}
            onClick={() => router.push('/signup')}
          >
            Free Account Create Karo →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>GetUniqueVault</h4>
            <p>Creators ke liye free digital assets platform</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Links</h4>
            <ul>
              <li><a href="/browse">Browse Assets</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/signup">Sign Up</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Follow Us</h4>
            <ul>
              <li><a href="#">TikTok</a></li>
              <li><a href="#">YouTube</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 GetUniqueVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
