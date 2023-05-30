import ThmLogo from '~/components/th-m.logo';
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
      'My brother and I are building Soundsculpt. It is the only royalty-free music platform that uses AI to empower creators, not cut them out.',
    image: 'https://soundsculpt.app/images/ss_icon_black.svg',
    link: 'https://soundsculpt.app',
  },
  {
    title: 'Kolla',
    description:
      'Working along side some top-dog alumni from Weave to make integrations delightful',
    image:
      'https://uploads-ssl.webflow.com/63cb002a99caee9711807d39/63cb002a99caee1eb1807dd0_logo-wide-orange-p-500.png',
    link: 'https://www.getkolla.com/',
  },
  {
    title: 'Blog',
    description: 'I take notes on stuff and publish it online',
    image: '/images/th_m-bald.webp',
    link: 'https://blog.th-m.codes/articles/',
  },
];

export default function Home() {
  return (
    <main class="text-center min-h-screen mx-auto text-gray-50 p-4 bg-slate-900">
      <h1 class="max-6-xs text-6xl font-thin uppercase my-16">th-m.codes</h1>
      {/* <ThmLogo fill="#fff" /> */}
      <div class="flex flex-col gap-4  justify-center">
        {projects.map((project: Project) => (
          <div class="flex flex-row justify h-72 justify-between gap-4 border-2 p-4 border-slate-600 rounded-md">
            <div class="w-3/12 max-w-xs p-8 self-center justify-self-center">
              <img src={project.image} />
            </div>
            <div class="flex flex-col h-64 flex-start items-start w-8/12">
              <h2 class="font-bold text-base text-lg py-4">{project.title}</h2>
              <p class="text-left flex-1"> {project.description}</p>
              <a href={project.link} target='_blank' class="self-end p-4 m-4 rounded-md bg-slate-600">
                <button>Check it out</button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
