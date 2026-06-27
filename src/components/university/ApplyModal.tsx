import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, Send, CheckCircle, BookOpen, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config";
import { getExtendedCourses } from "@/data/universityDetailsExtension";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ApplyModalProps {
  university: {
    id: string;
    name: string;
    courses?: string[];
  };
  user: {
    name?: string;
    email?: string;
  } | null;
  onClose: () => void;
}

const ApplyModal = ({ university, user, onClose }: ApplyModalProps) => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const extendedCourses = getExtendedCourses(university.id) || [];
  const courses = university.courses && university.courses.length > 0
    ? university.courses
    : extendedCourses.map(c => c.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError("Please select a course to continue.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/universities/${university.id}/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: selectedCourse }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Application submitted successfully!");
        onClose();
        navigate("/dashboard/user");
      } else if (res.status === 409) {
        toast.error("You have already applied to this university.");
        setError("You have already applied to this university.");
      } else {
        throw new Error(data.message || "Failed to submit application");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-md border border-border/50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">University Application</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Apply to <span className="font-medium text-accent">{university.name}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* User Details */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant Info</label>
              
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={user?.name || ""}
                  disabled
                  placeholder="Your Name"
                  className="pl-10 bg-secondary/20 cursor-not-allowed border-border/50"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={user?.email || ""}
                  disabled
                  placeholder="Your Email"
                  className="pl-10 bg-secondary/20 cursor-not-allowed border-border/50"
                />
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Select Program</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none cursor-pointer h-10 border-border/50"
                >
                  <option value="" disabled>-- Select a course/program --</option>
                  {courses.map((course, idx) => (
                    <option key={`course-${idx}`} value={course}>{course}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  ▼
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Submitting Application...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Application
                </span>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center mt-2 leading-relaxed">
              By submitting, you authorize Akshaya Academi to send your profile details to {university.name}.
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplyModal;
