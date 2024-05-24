'use client';
import Image from 'next/image'
import styles from './page.module.css'
import { useState, useEffect, useRef } from 'react'
import { RevealWrapper, RevealList } from  'next-reveal'
import Eclipse from '@/components/misc/loaders/eclipse'
import { Inter, Nunito, Poppins } from 'next/font/google'
import { BsTelephoneFill } from 'react-icons/bs'
import { FaUserAlt } from 'react-icons/fa'
import { AiOutlineSend } from 'react-icons/ai'
import { HiMail } from 'react-icons/hi'
import { BiMessageDetail } from 'react-icons/bi'

const inter = Inter({ weight: ['400', '500', '600'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '600', '700', '800'], subsets: ['latin'] })
const poppins = Poppins({ weight: ['400', '500', '600'], subsets: ['latin'] })

export default function Home() {
  const company_partners = [
    { name: 'Aegis', icon: 'aegis.jpeg' },
    { name: 'Allianz', icon: 'allianz.jpeg' },
    { name: 'Amara', icon: 'amara.jpeg' },
    { name: 'Cat', icon: 'cat.png' },
    { name: 'Commvault', icon: 'commvault.png' },
    { name: 'Congruent', icon: 'congruent.png' },
    { name: 'Contus', icon: 'contus.png' },
    { name: 'Decalthon', icon: 'decalthon.png' },
    { name: 'Dhyan', icon: 'dhyan.jpeg' },
    { name: 'Elgi', icon: 'elgi.jpg' },
    { name: 'Hcl', icon: 'hcl.png' },
    { name: 'Hdfc', icon: 'hdfc.png' },
    { name: 'Integra', icon: 'integra.jpg' },
    { name: 'Justdial', icon: 'justdial.png' },
    { name: 'Kaar', icon: 'kaar.jpeg' },
    { name: 'Matrimony', icon: 'matrimony.jpeg' },
    { name: 'Milagrow', icon: 'milagrow.jpg' },
    { name: 'Mphasis', icon: 'mphasis.jpg' },
    { name: 'Payoda', icon: 'payoda.jpg' },
    { name: 'Rane', icon: 'rane.jpeg' },
    { name: 'Rohde_schwarz', icon: 'rohde_schwarz.png' },
    { name: 'Saint_gobain', icon: 'saint_gobain.png' },
    { name: 'Sodexo', icon: 'sodexo.jpeg' },
    { name: 'Vanjax', icon: 'vanjax.jpeg' },
    { name: 'Velan', icon: 'velan.jpg' },
    { name: 'Videocon', icon: 'videocon.jpg' },
    { name: 'Wabco', icon: 'wabco.jpeg' },
    { name: 'Ziffity', icon: 'ziffity.jpg' }
  ]
  const about_descriptions = [
    {
      heading: 'Customized Training',
      content: 'Analytics specializes in training students in lateral thinking and aptitude, helping over 10,000 achieve their dream jobs while enhancing skills and college placement rates.'
    },
    {
      heading: 'Placement Opportunities',
      content: 'All the training comes down to getting a job. What if we bring companies to your campus for recruitment? Yes, that\'s what we do.'
    },
    {
      heading: 'Highly Experienced Trainers',
      content: 'Analytics was born with the motive to provide top quality training so we hire only highly experienced trainers. We deliver what we promise.'
    },
    {
      heading: 'Robust Assessment Platform',
      content: 'We train the students after assessing their capabilities. Thus we provide individual attention and individual assessment.'
    },
    {
      heading: 'Quality Online Tests',
      content: 'We provide top quality online tests at par with the actual tests of companies like TCS, Wipro, IBM, CTS, L&T Infotech, Infosys, Mu Sigma etc.'
    },
    {
      heading: 'Best Soft skills',
      content: 'Your students get the same training as those of IITs and MNCs.'
    }
  ]
  const testimonial_list = [
    {
      user: {
        name: 'M.Jayekumar',
        role: 'Placement Officer',
        institute: 'Manakula Vinayagar Institute of Technology, Pondicherry',
        avatar: ''
      },
      content: `We thank you for the intensive placement training given to all our students. The students felt that the training by Analytics was the best. It was better than many other leading placement training companies. Analytics is a young team with lots of experience and energy. Their training materials were a lot more engaging for the students and the material has been well structured in such a way that it can be used for any other aptitude exam preparation. The training methodology was very impressive and the student\`s feedback proved that right. The Company Specific Training Module for TCS was as excellent as last year. Training for AMCAT was really unique and has never been done by any other company.
      We would work with Analytics in all our future placement training. Thanks for your support`
    },
    {
      user: {
        name: 'Prof.Dr.A.Gandhi',
        role: 'Dean - Training & Placement',
        institute: 'Saveetha Engineering College',
        avatar: ''
      },
      content: `We thank you for giving a wonderful training to our final year students.The 
        trainers who came here also have done a good job.The students have given 
        good feedback and many of them said “Excellent”.Your actions exhibited your 
        professional maturity, approach and style of functioning.
        We shall revert to you when we start our training for the present pre-final years.
        Thank you once again`
    },
    {
      user: {
        name: 'Mahalakshmi',
        role: 'Dean',
        institute: 'Panimalar Engineering College',
        avatar: ''
      },
      content: `This is a great training with a wider scope which helped our students to recognize 
      their mistakes. It was excellently delivered with well-timed breaks. The tips that were 
      provided make the students understand better.It is a useful training for the students. 
      The material provided set a good foundation that can be applied practically.
      I recommend this course highly, as it takes you back to basics and remove the 
      mistakes and improve the quantitative ability of the students.`
    }
  ]
  const [testimonialList, setTestimonialList] = useState(testimonial_list.map((data, index) => ({...data, active: (index === 0) ? true : false})))
  
  const student_testimonials = [
    {
      user: {
        name: 'Poornima',
        company: 'CTS',
        institute: 'Syed Ammal Engineering College',
        avatar: ''
      },
      content: `Sir, I have attended 15 days of your training. Your class was really amazing and your techniques were astonishing. The problems that we usually used to solve in two to three minutes was solved by you in seconds, that too in a very different way`
    },
    {
      user: {
        name: 'Sourav',
        company: 'TCS',
        institute: 'MCKV Institute of Engineering, Kolkatta',
        avatar: ''
      },
      content: `The question pattern was very much similar to the ones that we did in the classes. The mock tests helped me to practice before the actual test. It saved me a lot of time in the test.`
    },
    {
      user: {
        name: 'Karthiga',
        company: 'L&T INFOTECH',
        institute: 'Manakula Vinayagar Institute of Technology',
        avatar: ''
      },
      content: `Your teaching style was very much different from others and it was easier to understand as it was purely based on logics and real time based. The way you approached the problems.`
    },
    {
      user: {
        name: 'Shubhranta',
        company: 'TCS',
        institute: 'MCKV Institute of Engineering, Kolkatta',
        avatar: ''
      },
      content: `Dear Sir,I am glad to inform you that finally I have been placed in TCS. This
      would not be possible without your guidance and assistance. Your training
      sessions helped me immensely to improve my skills in aptitude. Your techniques
      for solving problems were really unique and very easy to understand. These
      helped me to attempt all the questions in TCS aptitude test`
    },
    {
      user: {
        name: 'Martina',
        company: '',
        institute: 'Manakula Vinayagar Institute of Technology',
        avatar: ''
      },
      content: `The new way of approaching the problems helped me to manage my time during
      the online test for TCS. I have learned many new methods and shortcuts for
      various chapters in quants. Thanks for helping me. Your training would definitely
      help many students for easy solving and time saving approach in quants`
    },
    {
      user: {
        name: 'Gowri Dhakshayani',
        company: 'IBS',
        institute: 'Ponjesly College of Engineering',
        avatar: ''
      },
      content: `Your class is the best class I have ever attended for the aptitude. You
      are the best trainer a student can ever get in his/her life. Your way of
      teaching will make even the uninterested student to get actively involved
      in solving Quantitative aptitude. I have attended only 2 days of your
      class but it was enough for me to perform well in my placement exam.`
    },
  ]

  const testimonialRef = useRef<HTMLDivElement>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const studentTestimonialRef = useRef<HTMLDivElement>(null)
  const [currentStudentTestimonial, setCurrentStudentTestimonial] = useState(0)
  const [studentTestimonialList, setStudentTestimonialList] = useState(student_testimonials.map((data, index) => ({...data, active: (index === 0) ? true : false})))

  const services_list = [
    {
      title: 'Complete',
      content: `A complete course of aptitude training and softskills for all 4 years of college.
      We start with building very strong fundamentals like basic Arithmetic and English
      Grammar and go up to intensive training.
      
      Recommended for all 4 years`
    },
    {
      title: 'Elite',
      content: `For the students who already have a good understanding of the basic
      Arithmetic skills, English Grammar, Spoken English, Soft Skills and Basic
      Etiquettes .

      Recommended for 3rd and 4th years`
    },
    {
      title: 'Intensive',
      content: `This is the final lap of the training where intensive training is given for Quantitative
      Aptitude, Verbal Ability, Reasoning Ability, Group Discussion, Email and Essay
      Writing and various Soft Skills. Periodic Assessment Tests (5 online tests).
      
      Recommended for 4th year`
    },
    {
      title: 'Company Specific',
      content: `Separate Course modules for specific companies based on the need of the college. Recommended for TCS, CTS, Wipro, Infosys, Accenture, Capgemini, Zoho,
      Birlasoft, L&T Infotech, IBM, Mu Sigma.
      
      Recommended for 4th year`
    },
    {
      title: 'Refresher',
      content: `Revision courses for the final years students a few days before the Campus drive.
      Complete revision of all the core concepts and a few online tests
      
      Recommended for 4th year`
    },
    {
      title: 'MEEM (Maths, English and Etiquettes Module)',
      content: `Very basic Arithmetic, English Grammar and basic Etiquettes for rural background
      students/slow learners/first generation graduates
      
      Recommended for any 2 semesters`
    }
  ]

  function IconInput({ icon, placeholder, name }: { icon: any, placeholder: string, name: string }) {
    return (
      <div className={styles.iconInput_div}>
        {name === 'message' ? 
          <textarea className={['input_value', styles.iconInput_input, styles.iconInput_input_long, poppins.className].join(' ')} name={name} placeholder={placeholder} required />
          : 
          <>
            <span className={styles.iconInput_icon}>{icon}</span>
            <input type={name === 'phone' ? 'number' : 'string'} className={[styles.iconInput_input, poppins.className].join(' ')} name={name} placeholder={placeholder} required />
          </>
        }
      </div>
    )
  }

  async function SendForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formDataObject = Object.fromEntries(new FormData(form).entries());
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/contactus`, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(formDataObject)})
    } catch(error) { 
      console.error("Cannot Send the Form Data")
    }
    form.reset();
  }

  useEffect(() => {
    var current = 0
    var currentStudent = 0
    const interval = setInterval(() => {
      if (current < (testimonialList.length - 1)) {
        current++
        setTestimonialList(testimonialList.map((data, d_index) => ({...data, active: (d_index === current) ? true : false})))
      } else {
        current = 0
        setTestimonialList(testimonialList.map((data, d_index) => ({...data, active: (d_index === 0) ? true : false})))
      }
      if (currentStudent < (studentTestimonialList.length - 1)) {
        currentStudent++
        setStudentTestimonialList(studentTestimonialList.map((data, d_index) => ({...data, active: (d_index === currentStudent) ? true : false})))
      } else {
        currentStudent = 0
        setStudentTestimonialList(studentTestimonialList.map((data, d_index) => ({...data, active: (d_index === 0) ? true : false})))
      }
    }, 10000);
    clearInterval(interval);
  })

  return (
    <>
      <div id='home' className={[styles.header_div, styles.eclipse_header].join(' ')}>
        <div className={styles.main_content}>
          <div className={[styles.heading_div, poppins.className].join(' ')}>
            <span className={styles.heading}>Unleash Data-Driven Programming Excellence</span>
          </div>
          <span className={[styles.description, poppins.className].join(' ')}>Analytics will deliver an enriching and enlightening experience to 
your students. The expert team conducting the sessions would 
encourage and bring out positive changes among your students.</span>
        </div>
        <div className={styles.eclipse_div}>
          <Eclipse />
        </div>
      </div>
      <div id='about' style={{ gap: '5px' }} className={[styles.header_div, styles.about_description, poppins.className].join(' ')}>
        <span className={[styles.headings, nunito.className].join(' ')}>
          Why Analytics
        </span>
        <div className={styles.about_description_inner}>
          <RevealWrapper delay={0.1} duration={500} reset={true} origin='bottom' className={[styles.about_description_inner_side, "load-hidden"].join(' ')}>
            Empowering Minds, Coding Success, Shaping Tomorrow.
          </RevealWrapper>
          <RevealList delay={0.1} interval={250} reset={true} origin='bottom' className={[styles.about_description_box_container, "load-hidden"].join(' ')}>
            {about_descriptions.map((about, index) => 
              <div className={styles.about_description_box} key={index}>
                <span className={[styles.about_description_box_header, inter.className].join(' ')}>
                  {about.heading}
                </span>
                <span className={styles.about_description_box_contents}>
                  {about.content}
                </span>
              </div>
            )}
          </RevealList>
        </div>
      </div>
      <div style={{ flexDirection: 'column', gap: '25px', alignItems: 'center' }} className={styles.header_div}>
        <span className={[styles.headings, nunito.className].join(' ')}>
          TESTIMONIAL
        </span>
        <div ref={testimonialRef} className={[styles.testimonial_carousel_div, poppins.className].join(' ')}>
          {testimonialList.map((data, index) =>
            <div style={{ display: (data.active) ? 'flex' : 'none' }} className={styles.testimonial_div} key={index}>
              <span style={{ flex: 0.7 }} className={styles.testimonial_div_content}>
                {data.content}
              </span>
              <div style={{ flex: 0.3 }} className={styles.testimonial_div_user}>
                <div className={styles.testimonial_div_user_border}>
                  {(data.user.avatar !== '') &&
                    <Image className={styles.testimonial_div_user_avatar} alt={data.user.name} width={150} height={150} src={data.user.avatar} />
                  }
                  <span style={{ fontSize: '20px', fontWeight: 600 }} className={styles.testimonial_div_user_content}>
                    {data.user.name}
                  </span>
                  <span className={styles.testimonial_div_user_content}>
                    {data.user.institute}
                  </span>
                  <span className={styles.testimonial_div_user_content}>
                    {data.user.role}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className={styles.testimonial_active_dots_div}>
            {testimonialList.map((data, index) => 
              <span onClick={(event) => {setCurrentTestimonial(index); setTestimonialList(testimonialList.map((data, d_index) => ({...data, active: (d_index === index) ? true : false})))}} className={[styles.testimonial_active_dots, (data.active) ? styles.testimonial_active_dots_active : ''].join(' ')} key={index}></span>
            )}
          </div>
        </div>
      </div>
      <div className={[styles.header_div, styles.about_description, poppins.className].join(' ')}>
        <span className={[styles.headings, nunito.className].join(' ')}>
          Services
        </span>
        <RevealList delay={0.1} interval={250} reset={true} origin='bottom' className={[styles.about_description_box_container, "load-hidden"].join(' ')}>
          {services_list.map((service, index) =>
            <div className={styles.about_description_box} key={index}>
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', color: '#2334A6', fontSize: '18px', fontWeight: 600 }} className={styles.about_description_box_contents}>
                Analytics <span style={{ backgroundColor: '#2334A6', color: 'white', paddingInline: '10px', borderRadius: '10px' }}>{service.title}</span>
              </span>
              <span className={styles.about_description_box_contents}>
                {service.content}
              </span>
            </div>
          )}
        </RevealList>
      </div>
      <div className={[styles.header_div, styles.about_description, poppins.className].join(' ')}>
        <span className={[styles.headings, nunito.className].join(' ')}>
          STUDENTS TESTIMONIAL
        </span>
        <div ref={studentTestimonialRef} className={[styles.testimonial_carousel_div, poppins.className].join(' ')}>
          {studentTestimonialList.map((data, index) =>
            <div style={{ display: (data.active) ? 'flex' : 'none' }} className={styles.testimonial_div} key={index}>
              <span style={{ flex: 0.7 }} className={styles.testimonial_div_content}>
                {data.content}
              </span>
              <div style={{ flex: 0.3 }} className={styles.testimonial_div_user}>
                <div className={styles.testimonial_div_user_border}>
                  {(data.user.avatar !== '') &&
                    <Image className={styles.testimonial_div_user_avatar} alt={data.user.name} width={150} height={150} src={data.user.avatar} />
                  }
                  <span style={{ fontSize: '20px', fontWeight: 600 }} className={styles.testimonial_div_user_content}>
                    {data.user.name}
                  </span>
                  <span className={styles.testimonial_div_user_content}>
                    {data.user.institute}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className={styles.testimonial_active_dots_div}>
            {studentTestimonialList.map((data, index) => 
              <span onClick={(event) => {setCurrentStudentTestimonial(index); setStudentTestimonialList(studentTestimonialList.map((data, d_index) => ({...data, active: (d_index === index) ? true : false})))}} className={[styles.testimonial_active_dots, (data.active) ? styles.testimonial_active_dots_active : ''].join(' ')} key={index}></span>
            )}
          </div>
        </div>
      </div>
      <div style={{ flexDirection: 'column' }} className={[styles.header_div, poppins.className].join(' ')}>
        <span className={[styles.headings, nunito.className].join(' ')}>
          Company Partners
        </span>
        <RevealList delay={0.1} interval={100} origin='left' className={[styles.company_partner_list, "load-hidden"].join(' ')}>
          {company_partners.map(company => (
            <Image key={company.name} width={250} height={250} className={styles.company_logo} alt={company.name} src={`/companies/${company.icon}`} />
          ))}
        </RevealList>
      </div>
      <div id='contact' style={{ flexDirection: 'column' }} className={styles.header_div}>
        <span className={[styles.headings, nunito.className].join(' ')}>
          Get in touch with us
        </span>
        <span className={[styles.sub_header, poppins.className].join(' ')}>we provide 24/7 support for your queries and complaints</span>
        <form className={styles.contact_form} onSubmit={SendForm}>
          <div className={styles.contact_name}>
            <IconInput icon={<FaUserAlt />} name='firstname' placeholder='First Name' />
            <IconInput icon={<FaUserAlt />} name='lastname' placeholder='Last Name' />
          </div>
          <IconInput icon={<HiMail />} name='mail' placeholder='Mail Id' />
          <IconInput icon={<BsTelephoneFill />} name='phone' placeholder='Phone Number' />
          <IconInput icon={<BiMessageDetail />} name='message' placeholder='Message' />
          <button className={[styles.contact_send, poppins.className].join(' ')}>
            <span>Send</span>
            <span className={styles.send_icon}><AiOutlineSend /></span>
          </button>
        </form>
      </div>
    </>
  )
}