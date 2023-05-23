
// interface Props {
//   src: string;
//   id: string;
//   callback: () => void;
// }

// const loadScript = ({ src, id, callback }: Props) => {
//   const existingScript = document.getElementById(`${id}`);
//   if (!existingScript) {
//     const script = document.createElement('script');
//     script.src = src;
//     script.id = `${id}`;
//     document.body.appendChild(script);
//     script.onload = () => {
//       callback();
//     };
//   }
// };

// export const ScriptInjector = (props: Props) => {
//  loadScript(props);
//   return null;
// };

// export default ScriptInjector;
