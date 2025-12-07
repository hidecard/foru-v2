'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Heart, Sparkles, Clock, Feather, Puzzle, Star, MessageCircle, ArrowRight, MapPin, X, Music, Gift, Calendar, Camera, Download, Share2, Lock, Unlock, Mail, Phone, Map, Cake, Wine, Flower, Users, Gamepad2, Target, TrendingUp, MessageSquare, Zap, Smile } from 'lucide-react'
import emailjs from '@emailjs/browser'

interface StarMoment {
  id: string
  title: string
  content: string
  x: number
  y: number
  constellation: string[]
}

interface ShootingStar {
  id: number
  x: number
  y: number
  length: number
  speed: number
}

interface FloatingMessage {
  id: number
  text: string
  x: number
  y: number
  duration: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

interface MemoryItem {
  id: string
  title: string
  content: string
  date: string
  type: 'star' | 'message' | 'milestone'
}

interface LoveQuestion {
  id: string
  question: string
  type: 'would-you-rather' | 'truth-or-dare' | 'romantic' | 'funny'
}

interface DateIdea {
  id: string
  title: string
  description: string
  mood: 'romantic' | 'adventurous' | 'cozy' | 'creative' | 'fun' | 'casual' | 'meaningful' | 'exciting' | 'relaxing' | 'educational' | 'peaceful'
  icon: string
}

export default function Home() {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [name, setName] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [showConstellation, setShowConstellation] = useState(false)
  const [selectedStar, setSelectedStar] = useState<StarMoment | null>(null)
  const [starAnswers, setStarAnswers] = useState<Record<string, string>>({})
  const [currentStarIndex, setCurrentStarIndex] = useState(0)
  const [showRomanticFinal, setShowRomanticFinal] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [showPoem, setShowPoem] = useState(false)
  const [poemIndex, setPoemIndex] = useState(0)
  const [specialDate] = useState(new Date('2024-02-14')) // Valentine's Day
  const [daysUntil, setDaysUntil] = useState(0)
  
  // New crush features states
  const [activeTab, setActiveTab] = useState<'games' | 'compatibility' | 'playlist' | 'challenges'>('games')
  const [loveScore, setLoveScore] = useState(0)
  const [crushName, setCrushName] = useState('')
  const [yourName, setYourName] = useState('')
  const [compatibilityScore, setCompatibilityScore] = useState(0)
  const [playlist, setPlaylist] = useState<string[]>([])
  const [newSong, setNewSong] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [gameScore, setGameScore] = useState(0)
  const [challengeCompleted, setChallengeCompleted] = useState<string[]>([])
  const [selectedDateIdea, setSelectedDateIdea] = useState<DateIdea | null>(null)
  
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200])
  
  const formRef = useRef<HTMLDivElement>(null)
  const constellationRef = useRef<HTMLDivElement>(null)

  const romanticMessages = [
    "Every moment with you is magic",
    "You make my world brighter",
    "Your smile lights up my life",
    "I'm grateful for your love",
    "Together we're unstoppable",
    "You're my favorite constellation",
    "Love grows stronger with time",
    "You complete my universe"
  ]

  const lovePoem = [
    "In the vastness of space and time",
    "I found my anchor in your eyes",
    "Every star that shines above",
    "Reminds me of our precious love",
    "Through darkness and through light",
    "You're my forever, my delight"
  ]

  const loveQuestions: LoveQuestion[] = [
    {
      id: '1',
      question: 'Would you rather: Watch sunset together or sunrise together?',
      type: 'would-you-rather'
    },
    {
      id: '2',
      question: 'Would you rather: Cook dinner together or go to fancy restaurant?',
      type: 'would-you-rather'
    },
    {
      id: '3',
      question: 'Truth: What was your first impression of me?',
      type: 'truth-or-dare'
    },
    {
      id: '4',
      question: 'Dare: Send me a voice note saying something sweet',
      type: 'truth-or-dare'
    },
    {
      id: '5',
      question: 'What makes you feel most loved?',
      type: 'romantic'
    },
    {
      id: '6',
      question: 'If we were animals, what would we be?',
      type: 'funny'
    }
  ]

  const dateIdeas: DateIdea[] = [
    { id: '1', title: 'Stargazing Picnic', description: 'Blanket, snacks, and constellation watching', mood: 'romantic', icon: '⭐' },
    { id: '2', title: 'Adventure Quest', description: 'Scavenger hunt around the city', mood: 'adventurous', icon: '🗺️' },
    { id: '3', title: 'Movie Marathon', description: 'Cozy up with favorite films and snacks', mood: 'cozy', icon: '🎬' },
    { id: '4', title: 'Art & Wine', description: 'Paint together while sipping wine', mood: 'creative', icon: '🎨' },
    { id: '5', title: 'Sunset Beach Walk', description: 'Hand-in-hand walk as the sun sets', mood: 'romantic', icon: '🌅' },
    { id: '6', title: 'Cooking Challenge', description: 'Make a new recipe together', mood: 'creative', icon: '👨‍🍳' },
    { id: '7', title: 'Mini Road Trip', description: 'Drive to a nearby town and explore', mood: 'adventurous', icon: '🚗' },
    { id: '8', title: 'Bookstore Date', description: 'Browse books and pick one for each other', mood: 'cozy', icon: '📚' },
    { id: '9', title: 'Dance Night', description: 'Take a dance class together or dance at home', mood: 'fun', icon: '💃' },
    { id: '10', title: 'Farmers Market Stroll', description: 'Shop fresh produce and try local treats', mood: 'casual', icon: '🛒' },
    { id: '11', title: 'Karaoke Night', description: 'Sing your favorite songs together', mood: 'fun', icon: '🎤' },
    { id: '12', title: 'Hiking Adventure', description: 'Explore a scenic trail and enjoy nature', mood: 'adventurous', icon: '🥾' },
    { id: '13', title: 'Ice Cream Tasting', description: 'Try different flavors at a local shop', mood: 'fun', icon: '🍦' },
    { id: '14', title: 'Sunrise Yoga', description: 'Start the day with a calming yoga session together', mood: 'peaceful', icon: '🧘‍♀️' },
    { id: '15', title: 'DIY Spa Night', description: 'Relax with facials, massages, and bath bombs', mood: 'cozy', icon: '🛁' },
    { id: '16', title: 'Pottery Class', description: 'Make clay pots or sculptures together', mood: 'creative', icon: '🏺' },
    { id: '17', title: 'Biking Adventure', description: 'Bike through parks or trails', mood: 'adventurous', icon: '🚴‍♂️' },
    { id: '18', title: 'Coffee Tasting', description: 'Try different coffee blends at a café', mood: 'cozy', icon: '☕' },
    { id: '19', title: 'Board Game Night', description: 'Play competitive or cooperative games at home', mood: 'fun', icon: '🎲' },
    { id: '20', title: 'Volunteer Together', description: 'Spend a day helping a charity', mood: 'meaningful', icon: '🤝' },
    { id: '21', title: 'Sunset Rooftop Drinks', description: 'Enjoy cocktails with a city view', mood: 'romantic', icon: '🍹' },
    { id: '22', title: 'Zoo or Aquarium Visit', description: 'See exotic animals and marine life', mood: 'fun', icon: '🐠' },
    { id: '23', title: 'Mini Golf', description: 'Play mini golf for some playful competition', mood: 'fun', icon: '⛳' },
    { id: '24', title: 'Music Concert', description: 'Attend a live concert of your favorite band', mood: 'exciting', icon: '🎵' },
    { id: '25', title: 'Scenic Train Ride', description: 'Enjoy beautiful landscapes from a train', mood: 'relaxing', icon: '🚂' },
    { id: '26', title: 'Potluck Dinner', description: 'Cook dishes together and share with friends', mood: 'cozy', icon: '🍲' },
    { id: '27', title: 'Photography Walk', description: 'Take pictures of interesting spots in your city', mood: 'creative', icon: '📸' },
    { id: '28', title: 'Roller Skating', description: 'Go to a roller rink or park and skate together', mood: 'fun', icon: '🛼' },
    { id: '29', title: 'Visit a Museum', description: 'Explore art, history, or science exhibits', mood: 'educational', icon: '🏛️' },
    { id: '30', title: 'Sushi Making Night', description: 'Prepare sushi rolls together at home', mood: 'creative', icon: '🍣' },
    { id: '31', title: 'Camping Trip', description: 'Sleep under the stars in a tent or cabin', mood: 'adventurous', icon: '🏕️' },
    { id: '32', title: 'Hot Air Balloon Ride', description: 'See the landscape from above', mood: 'romantic', icon: '🎈' },
    { id: '33', title: 'Fishing Trip', description: 'Relax by a lake or river while fishing', mood: 'peaceful', icon: '🎣' },
    { id: '34', title: 'Visit Botanical Gardens', description: 'Stroll through beautiful flowers and plants', mood: 'peaceful', icon: '🌸' },
    { id: '35', title: 'Trivia Night', description: 'Test your knowledge at a local pub or online', mood: 'fun', icon: '❓' },
    { id: '36', title: 'Pot Painting', description: 'Paint flower pots for home décor', mood: 'creative', icon: '🖌️' },
    { id: '37', title: 'Theater Night', description: 'Watch a play or musical performance', mood: 'romantic', icon: '🎭' },
    { id: '38', title: 'Farm Visit', description: 'Pick fruits or feed animals together', mood: 'fun', icon: '🍓' },
    { id: '39', title: 'Bike & Picnic', description: 'Bike to a park and enjoy a picnic', mood: 'adventurous', icon: '🚲' },
    { id: '40', title: 'Sunrise Beach Yoga', description: 'Stretch and meditate as the sun rises', mood: 'peaceful', icon: '🌅🧘‍♂️' },
    { id: '41', title: 'Street Food Tour', description: 'Try street food from different vendors', mood: 'fun', icon: '🌮' },
    { id: '42', title: 'Ice Skating', description: 'Skate at an indoor rink or outdoor frozen lake', mood: 'fun', icon: '⛸️' },
    { id: '43', title: 'Puzzle Night', description: 'Work on a challenging puzzle together', mood: 'cozy', icon: '🧩' },
    { id: '44', title: 'Potluck Movie Night', description: 'Cook small dishes and watch a film together', mood: 'cozy', icon: '🍿' },
    { id: '45', title: 'Candlelit Dinner', description: 'Cook or order dinner and eat by candlelight', mood: 'romantic', icon: '🕯️' },
    { id: '46', title: 'Rock Climbing', description: 'Indoor or outdoor climbing challenge', mood: 'adventurous', icon: '🧗‍♀️' },
    { id: '47', title: 'Visit a Planetarium', description: 'Learn about stars and planets indoors', mood: 'romantic', icon: '🌌' },
    { id: '48', title: 'Boardwalk Stroll', description: 'Walk by the water and enjoy the breeze', mood: 'romantic', icon: '🌊' },
    { id: '49', title: 'Potluck Game Night', description: 'Cook and play games with friends', mood: 'fun', icon: '🎮' },
    { id: '50', title: 'Sunset Kayaking', description: 'Paddle together as the sun sets', mood: 'adventurous', icon: '🛶' }
  ]

  const chapters = [
    {
      title: "Before November 26",
      content: "You appeared like a quiet spark in darkness of my ordinary days.",
      icon: <Clock className="w-6 h-6" />,
      color: "from-gray-600 to-gray-400"
    },
    {
      title: "The Mystery",
      content: "I don't know your name... but your presence felt familiar, like a song I've heard before.",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-purple-600 to-pink-400"
    },
    {
      title: "The Feeling",
      content: "How can someone without a name mean so much? You became someone special without even trying.",
      icon: <Heart className="w-6 h-6" />,
      color: "from-rose-600 to-pink-400"
    },
    {
      title: "The Question",
      content: "Time introduced me to you. Can I keep knowing you... even if I don't know your name yet?",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-amber-600 to-orange-400"
    }
  ]

  const starMoments: StarMoment[] = [
    {
      id: 'match',
      title: 'Where our match appeared',
      content: 'The universe aligned when our paths first crossed. A spark in cosmic darkness.',
      x: 20,
      y: 30,
      constellation: ['match', 'smile']
    },
    {
      id: 'smile',
      title: 'Where first smile happened',
      content: 'Your smile lit up my world like a supernova, bright and unforgettable.',
      x: 35,
      y: 25,
      constellation: ['match', 'smile', 'words']
    },
    {
      id: 'words',
      title: 'Where your words warmed me',
      content: 'Every word from you was like stardust, magical and warming to my soul.',
      x: 50,
      y: 40,
      constellation: ['smile', 'words', 'realized']
    },
    {
      id: 'realized',
      title: 'Where I realized I liked you',
      content: 'In that moment, all of stars aligned and I knew - you were my constellation.',
      x: 65,
      y: 35,
      constellation: ['words', 'realized', 'more']
    },
    {
      id: 'more',
      title: 'Can I know you more?',
      content: 'Our constellation is beautiful, but I want to discover more stars with you.',
      x: 80,
      y: 30,
      constellation: ['realized', 'more', 'love']
    },
    {
      id: 'love',
      title: 'Do you love me?',
      content: 'After all these moments, after our constellation formed... I need to know. Do you feel the same cosmic love?',
      x: 90,
      y: 45,
      constellation: ['more', 'love']
    }
  ]

  // Calculate days until special date
  useEffect(() => {
    const calculateDays = () => {
      const today = new Date()
      const diffTime = specialDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysUntil(diffDays > 0 ? diffDays : 0)
    }
    
    calculateDays()
    const interval = setInterval(calculateDays, 1000 * 60 * 60) // Update every hour
    
    return () => clearInterval(interval)
  }, [specialDate])

  // Calculate love score based on answers
  useEffect(() => {
    if (Object.keys(starAnswers).length > 0) {
      const score = Object.values(starAnswers).reduce((acc, answer) => {
        if (answer.toLowerCase().includes('love')) return acc + 20
        if (answer.toLowerCase().includes('yes')) return acc + 15
        if (answer.toLowerCase().includes('forever')) return acc + 25
        if (answer.toLowerCase().includes('always')) return acc + 20
        return acc + 10
      }, 0)
      setLoveScore(Math.min(score, 100))
    }
  }, [starAnswers])



  // Handle keyboard visibility on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const keyboardHeight = windowHeight - viewportHeight
        
        if (keyboardHeight > 150) {
          setKeyboardHeight(keyboardHeight)
        } else {
          setKeyboardHeight(0)
        }
      }
    }
    
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  // Create floating messages
  useEffect(() => {
    const createFloatingMessage = () => {
      const message: FloatingMessage = {
        id: Date.now(),
        text: romanticMessages[Math.floor(Math.random() * romanticMessages.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        duration: Math.random() * 5 + 5
      }
      
      setFloatingMessages(prev => [...prev, message])
      
      setTimeout(() => {
        setFloatingMessages(prev => prev.filter(msg => msg.id !== message.id))
      }, message.duration * 1000)
    }
    
    // Create messages periodically
    const interval = setInterval(createFloatingMessage, 8000)
    
    return () => clearInterval(interval)
  }, [])

  // Create shooting stars
  useEffect(() => {
    const createShootingStar = () => {
      const newStar: ShootingStar = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 50,
        length: Math.random() * 80 + 20,
        speed: Math.random() * 0.5 + 0.5
      }
      
      setShootingStars(prev => [...prev, newStar])
      
      // Remove shooting star after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== newStar.id))
      }, 3000)
    }
    
    // Create shooting stars periodically
    const interval = setInterval(createShootingStar, 3000)
    
    // Create initial shooting stars
    for (let i = 0; i < 3; i++) {
      setTimeout(createShootingStar, i * 1000)
    }
    
    return () => clearInterval(interval)
  }, [])

  // Create particles on star click
  const createParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = []
    const colors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#C71585']
    
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const velocity = Math.random() * 3 + 2
      
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    
    setParticles(prev => [...prev, ...newParticles])
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, 2000)
  }, [])

  // Update particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1, // Gravity
        vx: particle.vx * 0.98 // Friction
      })))
    }, 16)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentChapter < chapters.length - 1) {
        setCurrentChapter(prev => prev + 1)
      } else {
        setShowQuestion(true)
        clearInterval(timer)
      }
    }, 4000)

    return () => clearInterval(timer)
  }, [currentChapter])

  useEffect(() => {
    if (showConstellation && starMoments.length > 0 && !selectedStar) {
      setSelectedStar(starMoments[0])
      setCurrentStarIndex(0)
    }
  }, [showConstellation])

  const handleNameSubmit = () => {
    if (name.trim()) {
      setRevealed(true)
      setTimeout(() => {
        setShowConstellation(true)
        setShowPoem(true)
      }, 3000)
    }
  }

  const handleStarAnswer = async (starId: string, answer: string) => {
    const updatedAnswers = { ...starAnswers, [starId]: answer }
    setStarAnswers(updatedAnswers)
    
    // Create particles at star position
    if (constellationRef.current && selectedStar) {
      const rect = constellationRef.current.getBoundingClientRect()
      const x = (selectedStar.x / 100) * rect.width
      const y = (selectedStar.y / 100) * rect.height
      createParticles(x, y)
    }
    

    
    setSelectedStar(null)
    
    // If this is the final love question, auto-send email and show romantic final
    if (starId === 'love') {
      setIsSendingEmail(true)
      setEmailStatus('idle')
      
      try {
        // Initialize EmailJS with your public key
        emailjs.init("a63OTrZoVHh5NRE_b")
        
        const templateParams = {
          from_name: name,
          message: answer,
          star_answers: JSON.stringify(updatedAnswers, null, 2),
          to_name: 'My Love',
          reply_to: 'hidecard1500@gmail.com', // Replace with your email
        }

        console.log('Sending email with params:', templateParams)
        console.log('Updated answers:', updatedAnswers)

        const response = await emailjs.send(
          'service_269pjgn',
          'template_tiqi688',
          templateParams
        )
        
        console.log('Email sent successfully:', response)
        setEmailStatus('success')
        
        setTimeout(() => {
          setShowRomanticFinal(true)
          setIsSendingEmail(false)
        }, 2000)
      } catch (error) {
        console.error('Failed to send email:', error)
        setEmailStatus('error')
        setIsSendingEmail(false)
        
        // Still show romantic final even if email fails
        setTimeout(() => {
          setShowRomanticFinal(true)
        }, 3000)
      }
    } else {
      // Move to next star if not the last one
      const currentIndex = starMoments.findIndex(s => s.id === starId)
      if (currentIndex < starMoments.length - 1) {
        setTimeout(() => {
          setSelectedStar(starMoments[currentIndex + 1])
          setCurrentStarIndex(currentIndex + 1)
        }, 500)
      }
    }
  }

  // Calculate compatibility
  const calculateCompatibility = () => {
    if (crushName && yourName) {
      // Simple compatibility calculation (you can make this more sophisticated)
      const combinedLength = crushName.length + yourName.length
      const commonLetters = crushName.toLowerCase().split('').filter(letter => 
        yourName.toLowerCase().includes(letter)
      ).length
      
      const score = Math.min(95, Math.floor((commonLetters / combinedLength) * 100 + Math.random() * 20))
      setCompatibilityScore(score)
    }
  }

  // Add song to playlist
  const addSong = () => {
    if (newSong.trim()) {
      setPlaylist(prev => [...prev, newSong])
      setNewSong('')
    }
  }

  // Generate random date idea
  const generateDateIdea = () => {
    const randomIndex = Math.floor(Math.random() * dateIdeas.length)
    setSelectedDateIdea(dateIdeas[randomIndex])
  }

  // Draw constellation lines
  const drawConstellation = () => {
    const lines: React.ReactElement[] = []
    for (const star of starMoments) {
      for (const connectedId of star.constellation) {
        const connectedStar = starMoments.find(s => s.id === connectedId)
        if (connectedStar) {
          lines.push(
            <svg
              key={`${star.id}-${connectedId}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <motion.line
                x1={`${star.x}%`}
                y1={`${star.y}%`}
                x2={`${connectedStar.x}%`}
                y2={`${connectedStar.y}%`}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </svg>
          )
        }
      }
    }
    return lines
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* 3D Starfield Background with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Static stars */}
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
              animationDelay: `${(i * 0.1) % 3}s`,
              opacity: 0.3 + (i % 3) * 0.2,
              transform: `translateZ(${(i % 5) * 10}px)`
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {shootingStars.map(star => (
          <motion.div
            key={star.id}
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.length}px`,
              height: '2px',
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              x: star.length,
              y: star.length * 0.6
            }}
            transition={{ 
              duration: star.speed, 
              ease: "linear" 
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-white rounded-full" />
          </motion.div>
        ))}
      </motion.div>

      {/* Floating messages */}
      {floatingMessages.map(message => (
        <motion.div
          key={message.id}
          className="absolute text-pink-200 text-sm md:text-base font-medium pointer-events-none"
          style={{
            left: `${message.x}%`,
            top: `${message.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.8, 1, 0.8],
            y: -20
          }}
          transition={{ 
            duration: message.duration,
            ease: "easeInOut"
          }}
        >
          {message.text}
        </motion.div>
      ))}

      {/* Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ 
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 2 }}
        />
      ))}

      {/* Poem display */}
      <AnimatePresence>
        {showPoem && !showConstellation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md text-center"
            >
              <h3 className="text-xl font-bold text-white mb-4">A Poem For You</h3>
              <div className="space-y-2 text-purple-100">
                {lovePoem.slice(0, poemIndex + 1).map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.5 }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Special date countdown */}
      <AnimatePresence>
        {revealed && !showConstellation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 right-4 z-40 bg-white/10 backdrop-blur-md rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-medium">Special Day Countdown</span>
            </div>
            <div className="text-2xl font-bold text-pink-300">{daysUntil}</div>
            <div className="text-xs text-purple-200">days until our day</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          {!showQuestion ? (
            <motion.div
              key={currentChapter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
              className="text-center max-w-2xl mx-auto w-full"
            >
              <motion.div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${chapters[currentChapter].color} mb-8`}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {chapters[currentChapter].icon}
              </motion.div>

              <motion.h1
                className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-purple-200"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {chapters[currentChapter].title}
              </motion.h1>

              <motion.p
                className="text-base md:text-lg lg:text-xl text-purple-100 leading-relaxed mb-8 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                {chapters[currentChapter].content}
              </motion.p>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mb-8">
                {chapters.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-500 ${index <= currentChapter ? 'w-8 bg-gradient-to-r from-pink-400 to-purple-400' : 'w-2 bg-purple-800'
                      }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: index === currentChapter ? 1.2 : 1 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center max-w-4xl mx-auto w-full"
              style={{ marginBottom: keyboardHeight ? `${keyboardHeight}px` : 0 }}
            >
              {!revealed ? (
                <>
                  <motion.div
                    className="mb-8"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-16 h-16 text-pink-400 mx-auto" />
                  </motion.div>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 px-4">
                    May I know your name?
                  </h2>

                  <p className="text-purple-200 mb-8 px-4 text-base md:text-lg">
                    The girl who touched me without saying her name...<br />
                    The one who made everything brighter.<br />
                    The missing piece of my puzzle.
                  </p>

                  <div 
                    ref={formRef}
                    className="space-y-4 px-4 max-w-md mx-auto w-full"
                    style={{ 
                      position: keyboardHeight ? 'fixed' : 'relative',
                      bottom: keyboardHeight ? 0 : 'auto',
                      left: keyboardHeight ? '50%' : 'auto',
                      transform: keyboardHeight ? 'translateX(-50%)' : 'none',
                      width: keyboardHeight ? '90%' : 'auto',
                      maxWidth: keyboardHeight ? '400px' : 'auto',
                      zIndex: keyboardHeight ? 100 : 'auto'
                    }}
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name..."
                      className="w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-purple-300 border border-purple-400/30 focus:outline-none focus:border-pink-400 transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                      autoFocus
                    />

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNameSubmit}
                      className="w-full px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
                    >
                      Reveal Your Name
                    </motion.button>

                    <div className="mt-8 flex justify-center gap-4">
                      <button className="px-6 py-2 rounded-full bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 transition-colors">
                        Maybe
                      </button>
                      <button className="px-6 py-2 rounded-full bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 transition-colors">
                        Not Yet
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center px-4"
                >
                  <div className="mb-8">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                    >
                      <Star className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                    Hello, {name}!
                  </h2>

                  <p className="text-lg md:text-xl text-purple-100 mb-8">
                    Now the mystery has a name.<br />
                    Now the feeling has a face.<br />
                    Now my world has you.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Constellation Map */}
        <AnimatePresence>
          {showConstellation && !showRomanticFinal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 flex items-center justify-center p-4"
            >
              <div 
                ref={constellationRef}
                className="relative w-full h-[70vh] md:h-[80vh] lg:h-[600px] bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <h2 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg md:text-xl lg:text-2xl font-bold text-white z-10 px-4 text-center">
                  Our Constellation Journey
                </h2>
                
                {/* Draw constellation lines */}
                {drawConstellation()}
                
                {/* Stars */}
                {starMoments.map((star, index) => (
                  <motion.button
                    key={star.id}
                    className={`absolute w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                      starAnswers[star.id] 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                        : 'bg-white/80 hover:bg-yellow-300'
                    } ${selectedStar?.id === star.id ? 'ring-4 ring-yellow-400' : ''}`}
                    style={{
                      left: `${star.x}%`,
                      top: `${star.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: starAnswers[star.id] ? 5 : 2
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    onClick={() => setSelectedStar(star)}
                  >
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </motion.button>
                ))}
                
                {/* Star detail modal */}
                <AnimatePresence>
                  {selectedStar && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 md:p-6 text-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg md:text-xl font-bold pr-2">{selectedStar.title}</h3>
                        <button
                          onClick={() => setSelectedStar(null)}
                          className="text-white/70 hover:text-white flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <p className="mb-4 text-purple-100 text-sm md:text-base">{selectedStar.content}</p>
                      
                      {selectedStar.id === 'love' ? (
                        <div className="space-y-3">
                          <p className="text-base md:text-lg font-semibold text-pink-300">This is our final star. Your answer matters deeply.</p>
                          
                          {isSendingEmail && (
                            <div className="text-center py-2">
                              {emailStatus === 'idle' && <p className="text-yellow-300">Sending your message to the stars...</p>}
                              {emailStatus === 'success' && <p className="text-green-300">✓ Your message has reached the stars!</p>}
                              {emailStatus === 'error' && <p className="text-red-300">✗ Failed to send, but your journey continues...</p>}
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStarAnswer(selectedStar.id, 'Yes, I love you too')}
                              disabled={isSendingEmail}
                              className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50"
                            >
                              Yes, I love you too
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStarAnswer(selectedStar.id, 'I need more time')}
                              disabled={isSendingEmail}
                              className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white font-semibold disabled:opacity-50"
                            >
                              I need more time
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            placeholder="Share your thoughts about this moment..."
                            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-purple-300 border border-purple-400/30 focus:outline-none focus:border-pink-400 resize-none text-sm md:text-base"
                            rows={3}
                            id={`star-${selectedStar.id}`}
                          />
                          <div className="flex justify-end">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const input = document.getElementById(`star-${selectedStar.id}`) as HTMLTextAreaElement;
                                if (input && input.value.trim()) {
                                  handleStarAnswer(selectedStar.id, input.value);
                                }
                              }}
                              className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                            >
                              Continue
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Romantic Final Page with New Crush Features */}
        <AnimatePresence>
          {showRomanticFinal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 z-50 overflow-y-auto"
            >
              <div className="min-h-screen p-4 md:p-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500 text-white font-semibold shadow-lg mb-6"
                  >
                    <Heart className="w-8 h-8 md:w-12 md:h-12 text-white" />
                    <span className="text-white font-semibold text-sm md:text-base">Crush Connection</span>
                    <Zap className="w-4 h-4 md:w-6 md:h-6 text-pink-400" />
                    <Zap className="w-4 h-4 md:w-6 md:h-6 text-pink-400" />
                  </motion.div>

                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Let's Explore Our Connection, {name}!
                  </h1>

                  <p className="text-lg md:text-xl text-purple-100 mb-6">
                    Discover the sparks between us with fun games and activities!<br />
                    Every moment brings us closer together.
                  </p>

                  {/* Love Score Display */}
                  <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span className="text-white font-medium">Connection Score: {loveScore}%</span>
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex gap-1">
                    {[
                      { id: 'games', label: 'Games', icon: <Gamepad2 className="w-4 h-4" /> },
                      { id: 'playlist', label: 'Playlist', icon: <Music className="w-4 h-4" /> },
                      { id: 'challenges', label: 'Challenges', icon: <TrendingUp className="w-4 h-4" /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                            : 'text-purple-200 hover:text-white'
                        }`}
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="max-w-6xl mx-auto">
                  {/* Games Tab */}
                  {activeTab === 'games' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-pink-400/30">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                          <Gamepad2 className="w-6 h-6 text-pink-400" />
                          Love Games
                        </h3>
                        
                        {currentQuestion < loveQuestions.length && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-sm text-purple-300">Question {currentQuestion + 1} of {loveQuestions.length}</span>
                              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${((currentQuestion + 1) / loveQuestions.length) * 100}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-xl p-6 mb-4">
                              <p className="text-lg text-white mb-4">{loveQuestions[currentQuestion].question}</p>
                              
                              <div className="flex flex-col sm:flex-row gap-3">
                                {loveQuestions[currentQuestion].type === 'would-you-rather' && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        setGameScore(gameScore + 10)
                                        setCurrentQuestion(currentQuestion + 1)
                                      }}
                                      className="flex-1 px-4 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                                    >
                                      First Option
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        setGameScore(gameScore + 10)
                                        setCurrentQuestion(currentQuestion + 1)
                                      }}
                                      className="flex-1 px-4 py-3 rounded-full bg-white/20 text-white font-semibold"
                                    >
                                      Second Option
                                    </motion.button>
                                  </>
                                )}
                                
                                {loveQuestions[currentQuestion].type === 'truth-or-dare' && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        setGameScore(gameScore + 15)
                                        setCurrentQuestion(currentQuestion + 1)
                                      }}
                                      className="flex-1 px-4 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                                    >
                                      Truth
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        setGameScore(gameScore + 20)
                                        setCurrentQuestion(currentQuestion + 1)
                                      }}
                                      className="flex-1 px-4 py-3 rounded-full bg-white/20 text-white font-semibold"
                                    >
                                      Dare
                                    </motion.button>
                                  </>
                                )}
                                
                                {(loveQuestions[currentQuestion].type === 'romantic' || loveQuestions[currentQuestion].type === 'funny') && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setGameScore(gameScore + 25)
                                      setCurrentQuestion(currentQuestion + 1)
                                    }}
                                    className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                                  >
                                    Answer Together
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {currentQuestion >= loveQuestions.length && (
                          <div className="text-center">
                            <h4 className="text-2xl font-bold text-white mb-4">Game Complete!</h4>
                            <p className="text-lg text-purple-200 mb-6">Your Score: {gameScore} points</p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setCurrentQuestion(0)
                                setGameScore(0)
                              }}
                              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                            >
                              Play Again
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}



                  {/* Playlist Tab */}
                  {activeTab === 'playlist' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-pink-400/30">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                          <Music className="w-6 h-6 text-pink-400" />
                          Our Love Playlist
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                          {playlist.map((song, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white/5 rounded-lg p-4 flex items-center gap-3"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{song}</p>
                                <p className="text-purple-300 text-sm">Added by you</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={newSong}
                            onChange={(e) => setNewSong(e.target.value)}
                            placeholder="Add a song to our playlist..."
                            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-purple-300 border border-purple-400/30 focus:outline-none focus:border-pink-400"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={addSong}
                            className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                          >
                            Add to Playlist
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Challenges Tab */}
                  {activeTab === 'challenges' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-pink-400/30">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                          <TrendingUp className="w-6 h-6 text-pink-400" />
                          Couple's Challenges
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {[
                            { title: "Send a good morning text", icon: "🌅", points: 10 },
                            { title: "Share a favorite memory", icon: "💭", points: 15 },
                            { title: "Plan a surprise date", icon: "🎁", points: 25 },
                            { title: "Write a love letter", icon: "💌", points: 20 },
                            { title: "Take a selfie together", icon: "📸", points: 10 },
                            { title: "Cook a meal together", icon: "🍳", points: 30 }
                          ].map((challenge, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={`bg-white/5 rounded-lg p-4 border ${
                                challengeCompleted.includes(challenge.title)
                                  ? 'border-green-400/30'
                                  : 'border-purple-400/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{challenge.icon}</span>
                                <div className="flex-1">
                                  <p className="text-white font-medium">{challenge.title}</p>
                                  <p className="text-purple-300 text-sm">{challenge.points} points</p>
                                </div>
                                {challengeCompleted.includes(challenge.title) ? (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setChallengeCompleted([...challengeCompleted, challenge.title])}
                                    className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                                  >
                                    <span className="text-white text-xs">+</span>
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="text-center">
                          <p className="text-lg text-purple-200 mb-4">
                            Total Points: {challengeCompleted.reduce((acc, title) => {
                              const challenge = [
                                { title: "Send a good morning text", points: 10 },
                                { title: "Share a favorite memory", points: 15 },
                                { title: "Plan a surprise date", points: 25 },
                                { title: "Write a love letter", points: 20 },
                                { title: "Take a selfie together", points: 10 },
                                { title: "Cook a meal together", points: 30 }
                              ].find(c => c.title === title)
                              return acc + (challenge?.points || 0)
                            }, 0)}
                          </p>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateDateIdea}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                          >
                            Generate Date Idea
                          </motion.button>
                        </div>
                        
                        {selectedDateIdea && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-white/5 rounded-lg p-4 text-center"
                          >
                            <div className="text-3xl mb-2">{selectedDateIdea.icon}</div>
                            <h4 className="text-xl font-bold text-white mb-2">{selectedDateIdea.title}</h4>
                            <p className="text-purple-200">{selectedDateIdea.description}</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-12"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-pink-400/30 max-w-2xl mx-auto">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">Our Connection</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3 text-purple-200">
                        <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        <span className="text-sm md:text-base">Every game brings us closer</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Heart className="w-5 h-5 text-pink-400 flex-shrink-0" />
                        <span className="text-sm md:text-base">Our playlist tells our story</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span className="text-sm md:text-base">Challenges strengthen our bond</span>
                      </div>
                      <div className="flex items-center gap-3 text-purple-200">
                        <Flower className="w-5 h-5 text-pink-400 flex-shrink-0" />
                        <span className="text-sm md:text-base">Our connection is blooming...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 opacity-30 hidden md:block">
          <Feather className="w-8 h-8 text-pink-300 animate-float" />
        </div>
        <div className="absolute top-20 right-20 opacity-30 hidden md:block">
          <Puzzle className="w-8 h-8 text-purple-300 animate-float-delayed" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-30 hidden md:block">
          <Sparkles className="w-8 h-8 text-yellow-300 animate-float" />
        </div>
      </div>
    </div>
  )
}