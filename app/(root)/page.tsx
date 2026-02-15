import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

const companies = [
    { name: "Google", logo: "/covers/spotify.png" }, // Reusing existing assets for demo
    { name: "TCS", logo: "/covers/amazon.png" },
    { name: "Infosys", logo: "/covers/facebook.png" },
    { name: "Adobe", logo: "/covers/adobe.png" },
    { name: "Quora", logo: "/covers/quora.png" },
  ];

  return (
    <>
     <section className="card-cta bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat">

  <div className="flex flex-col gap-6 max-w-lg">
    <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
    <p className="text-lg">
      Practice real interview questions & get instant feedback
    </p>

    <Button asChild className="btn-primary max-sm:w-full">
      <Link href="/interview">Start an Interview</Link>
    </Button>
  </div>

  <Image
    src="/robot.png"
    alt="robo-dude"
    width={400}
    height={400}
    className="max-sm:hidden"
  />

</section>

{/* 3. SLIDING COMPANY LOGOS */}
        <div className="w-full py-10 overflow-hidden  border-pink-100 ">
          
          <div className="flex gap-20 animate-marquee whitespace-nowrap">
            {[...companies, ...companies].map((company, i) => (
              <div key={i} className="flex items-center gap-3   transition-all cursor-default">
                <Image src={company.logo} alt={company.name} width={40} height={40} className="rounded-lg" />
                <span className="text-xl font-bold text-gray-400">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
