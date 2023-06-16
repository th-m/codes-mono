import {ThmLogoV3} from '~/components/th-m.logo';
interface Project {
  link: string;
  title: string;
  description: string;
  image: string;
}
const projects = [
  {
    title: 'SoundSculpt',
    description:
      'The only royalty-free music platform that uses AI to empower creators, not cut them out.',
    image: 'https://soundsculpt.app/images/ss_icon_black.svg',
    link: 'https://soundsculpt.app',
  },
  {
    title: 'Blog',
    description: 'I take notes on stuff and publish it online',
    image: '/images/th_m-bald.webp',
    link: 'https://blog.th-m.codes/articles/',
  },
  {
    title: 'Kolla',
    description:
      'Working along side some top-dog alumni from Weave to make integrations delightful',
    image:
      'https://uploads-ssl.webflow.com/63cb002a99caee9711807d39/63cb002a99caee1eb1807dd0_logo-wide-orange-p-500.png',
    link: 'https://www.getkolla.com/',
  },
  
];

export default function Home() {
  return (
    <main class="text-center min-h-screen mx-auto text-gray-50 p-4 bg-slate-900">
      <div>
        <div class="max-w-3xl mx-auto">
          <ThmLogoV3 fil0='none' fil1='#475569' fil2="#fff"/>
        </div>
      </div>
      <div class="@container flex flex-row gap-4 justify-center mt-6 max-w-3xl mx-auto flex-wrap">
        {projects.map((project: Project) => (
          <a
            href={project.link}
            target="_blank"
            class="p-4 m-4 rounded-md bg-slate-600 border border-slate-600 flex items-center justify-center flex-grow hover:bg-slate-900"
          >
            <div class="w-52 h-52 flex items-center ">
              <img src={project.image} />
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
