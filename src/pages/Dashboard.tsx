import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, Calendar, MessageSquare, Bell, Settings, LogOut, ChevronRight, Star, AlertTriangle, Wallet, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Enrollment {
  id: string;
  courseId: string;
  progress: number;
  courseTitle?: string;
  courseImage?: string;
}

interface Booking {
  id: string;
  category: string;
  date: string;
  time: string;
  status: string;
}

interface ForumPost {
  id: string;
  title: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
    const bookingsQuery = query(collection(db, 'consultations'), where('userId', '==', user.uid));
    const postsQuery = query(collection(db, 'forumPosts'), where('authorId', '==', user.uid));

    const unsubEnrollments = onSnapshot(enrollmentsQuery, async (snapshot) => {
      const enrollmentData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
      
      // Fetch course details for each enrollment
      const enrichedEnrollments = await Promise.all(enrollmentData.map(async (enr) => {
        const courseSnap = await getDocs(query(collection(db, 'courses'), where('__name__', '==', enr.courseId)));
        if (!courseSnap.empty) {
          const course = courseSnap.docs[0].data();
          return { ...enr, courseTitle: course.title, courseImage: course.image };
        }
        return enr;
      }));

      setEnrollments(enrichedEnrollments);
    });

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    });

    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumPost)));
      setLoading(false);
    });

    return () => {
      unsubEnrollments();
      unsubBookings();
      unsubPosts();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-4 py-32 text-center">
        <div className="rounded-full bg-emerald-50 p-8 text-emerald-600">
          <User className="h-16 w-16" />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Access Denied</h1>
          <p className="max-w-md text-lg text-slate-600">
            Please sign in to access your user dashboard.
          </p>
        </div>
        <Link
          to="/"
          className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-700 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const stats = [
    { icon: BookOpen, label: 'Enrolled Courses', value: enrollments.length.toString(), color: 'bg-blue-50 text-blue-600' },
    { icon: Calendar, label: 'Upcoming Bookings', value: bookings.length.toString(), color: 'bg-emerald-50 text-emerald-600' },
    { icon: MessageSquare, label: 'Forum Posts', value: posts.length.toString(), color: 'bg-purple-50 text-purple-600' },
    { icon: Star, label: 'OMT Tokens', value: (user.omtBalance || 0).toString(), color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {!user.verified && (
        <div className="mb-12 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Verify Your Email</h3>
              <p className="text-sm text-amber-700">Please verify your email address to unlock all features of the OMETS platform.</p>
            </div>
          </div>
          <Link
            to="/verify"
            className="rounded-xl bg-amber-600 px-6 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-all"
          >
            Verify Now
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="h-full w-full p-6 text-slate-400" />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">{user.displayName || 'User'}</h2>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{user.role}</p>
            </div>
          </div>

          {/* Wallet Widget */}
          <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-white/10 p-2">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">OMETS Wallet</span>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-400">Current Balance</p>
              <h3 className="text-3xl font-bold">{user.omtBalance || 0} <span className="text-sm font-medium text-emerald-400">OMT</span></h3>
            </div>
            <button className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold hover:bg-emerald-700 transition-all">
              Top Up Tokens
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm">
              <User className="h-5 w-5" /> Profile
            </Link>
            <Link to="/courses" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <BookOpen className="h-5 w-5" /> My Courses
            </Link>
            <Link to="/consultation" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Calendar className="h-5 w-5" /> My Bookings
            </Link>
            <Link to="/community" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <MessageSquare className="h-5 w-5" /> My Discussions
            </Link>
            <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="h-5 w-5" /> Notifications
            </button>
            <Link to="/profile-settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Settings className="h-5 w-5" /> Settings
            </Link>
            <button
              onClick={() => {
                signOut();
                navigate('/');
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col gap-12">
          {/* Welcome */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome back, {user.displayName?.split(' ')[0] || 'Engineer'}!</h1>
            <p className="text-lg text-slate-600">Track your learning progress and upcoming engineering sessions.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="flex flex-col gap-6">
             <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
             <div className="flex flex-col gap-4">
                {[
                  { id: 1, type: 'enrollment', title: 'Enrolled in Advanced Mechanical Design', date: '2 hours ago', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
                  { id: 2, type: 'token', title: 'Earned 50 OMT Tokens', date: '5 hours ago', icon: Wallet, color: 'text-amber-600 bg-amber-50' },
                  { id: 3, type: 'booking', title: 'Scheduled Thermal Consultation', date: 'Yesterday', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
                  { id: 4, type: 'community', title: 'Commented on Modern Manufacturing', date: '2 days ago', icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
                ].map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                     <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", activity.color)}>
                        <activity.icon className="h-5 w-5" />
                     </div>
                     <div className="flex flex-col flex-grow">
                        <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.date}</p>
                     </div>
                     <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
             </div>
          </div>

          {/* My Courses */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">My Courses</h3>
              <Link to="/courses" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
            </div>
            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {enrollments.map((enrollment) => (
                  <Link key={enrollment.id} to={`/courses/${enrollment.courseId}`} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                      <img src={enrollment.courseImage || `https://picsum.photos/seed/${enrollment.courseId}/200/200`} alt="Course" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col gap-1 flex-grow">
                      <h4 className="font-bold text-slate-900">{enrollment.courseTitle || 'Loading...'}</h4>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${enrollment.progress || 0}%` }} />
                      </div>
                      <p className="text-xs text-slate-500">{enrollment.progress || 0}% Complete</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500">You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="mt-4 inline-block text-sm font-bold text-emerald-600 hover:underline">Browse Courses</Link>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-slate-900">Upcoming Sessions</h3>
            {bookings.length > 0 ? (
              <div className="flex flex-col gap-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 p-4 text-emerald-600">
                        <span className="text-xs font-bold uppercase">{booking.date.split('-')[1]}</span>
                        <span className="text-2xl font-bold">{booking.date.split('-')[2]}</span>
                      </div>
                      <div className="flex flex-col gap-1 flex-grow">
                        <h4 className="font-bold text-slate-900">{booking.category} Consultation</h4>
                        <p className="text-sm text-slate-500">{booking.date} • {booking.time} • {booking.status}</p>
                      </div>
                      <button className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                        Join Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500">No upcoming sessions scheduled.</p>
                <Link to="/consultation" className="mt-4 inline-block text-sm font-bold text-emerald-600 hover:underline">Book a Consultation</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
