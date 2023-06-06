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
      'The only royalty-free music platform that uses AI to empower creators, not cut them out.',
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
      <div>
        <div class="max-w-xl mx-auto">
          <ThmLogo fill="#fff" />
        </div>
      </div>
      <div class="@container flex flex-col gap-4 justify-center mt-6 max-w-lg mx-auto">
        {projects.map((project: Project) => (
          <a
            href={project.link}
            target="_blank"
            class="self-center justify-self-center p-4 m-4 rounded-md bg-slate-600 @[618px]:self-end"
          >
            <div class="flex flex-row justify justify-between gap-4 border-2 p-4 border-slate-600 rounded-md @[618px]:flex-row">
              <div class="w-5/12 max-w-xs p-8 self-center justify-self-center @[618px]:w-3/12">
                <img src={project.image} />
              </div>
              {/* <div class="flex flex-row justify justify-between  @[618px]:flex-row"> */}
              <div class="w-7/12 flex flex-col items-center ">
                <h2 class="font-bold text-left self-start text-lg py-4">
                  {project.title}
                </h2>
                <p class="text-left  flex-1">
                  {' '}
                  {project.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
