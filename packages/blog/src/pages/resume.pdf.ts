/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-inner-declarations */
import type { APIRoute } from 'astro';
import pdf from 'pdfjs';
import CourierBold from 'pdfjs/font/Courier-Bold';
import CourierBoldOblique from 'pdfjs/font/Courier-BoldOblique';
import CourierOblique from 'pdfjs/font/Courier-Oblique';
import Courier from 'pdfjs/font/Courier';
import HelveticaBold from 'pdfjs/font/Helvetica-Bold';
import HelveticaBoldOblique from 'pdfjs/font/Helvetica-BoldOblique';
import HelveticaOblique from 'pdfjs/font/Helvetica-Oblique';
import Helvetica from 'pdfjs/font/Helvetica';
import Symbol from 'pdfjs/font/Symbol';
import TimesBold from 'pdfjs/font/Times-Bold';
import TimesBoldItalic from 'pdfjs/font/Times-BoldItalic';
import TimesItalic from 'pdfjs/font/Times-Italic';
import TimesRoman from 'pdfjs/font/Times-Roman';
import ZapfDingbats from 'pdfjs/font/ZapfDingbats';

const fonts = {
  CourierBold,
  CourierBoldOblique,
  CourierOblique,
  Courier,
  HelveticaBold,
  HelveticaBoldOblique,
  HelveticaOblique,
  Helvetica,
  Symbol,
  TimesBold,
  TimesBoldItalic,
  TimesItalic,
  TimesRoman,
  ZapfDingbats,
};

export const get: APIRoute = async function get() {
  try {
    const doc = new pdf.Document({ font: fonts.Helvetica, padding: 0 });
  
    doc
      .cell({ paddingBottom: 0.5 * pdf.cm, paddingTop: 1 * pdf.cm })
      .text('Thomas Valadez', { fontSize: 24, color:0x233655, alignment: 'center', font: fonts.HelveticaBold });

    doc
      .cell({ paddingBottom: 0.33 * pdf.cm })
      .text('1622 S 2500 E, New Harmony, UT 84757   hello@th-m.codes   (435)-218-8054', {
        fontSize: 9,
        alignment: 'center',
        font: fonts.Helvetica,
      });

   
    doc
      .cell({ padding: 1 * pdf.cm, paddingTop: 0.5 * pdf.cm, paddingBottom: 0.5 * pdf.cm, backgroundColor: 0x233655 })
      .text()
      .add(
        "An ambitious Software Engineer with a decade of experience, specializing in frontend web development Typescript and React. Competent backend developer with a preference toward GCP and golang. Several years of Engineering management experience. ",
        // "Highly skilled Software Engineer with a decade's expertise in frontend web development, TypeScript, React, and engineering management. Renowned for delivering innovative software solutions for enterprise-level clients, exhibiting prowess in design, testing, and project execution. Outstanding acumen for handling complex projects that require a blend of technical knowledge, leadership, and delivery skills. Keen to bring these competencies to Figma, fostering user-friendly design and collaboration.",
        // 'A Software Engineer with over 10 years of experience specializing in engineering management, frontend web development with a focus on TypeScript and React. Proven track record of designing, testing, and delivering innovative software solutions for enterprise clients. Exceptional ability to manage complex projects, demonstrating a strong blend of technical, team leadership, and project delivery skills.',
        {
          font:fonts.Helvetica,
          color: 0xc4c9d1,
          fontSize:9,
        }
      );

    const overViewRow = doc
      .cell({paddingLeft:1*pdf.cm, paddingRight:1*pdf.cm})
      .table({ widths: [null, null, null], padding: .01 * pdf.cm, paddingTop: 0.5 * pdf.cm, paddingBottom: 1 * pdf.cm })
      .row();

    function addRow(table, cellOptions:any = undefined) {
      const tr = table.row();
      const article = tr.cell(cellOptions).text();
      return article;
    }
    const education = overViewRow.cell().table({ widths: [null]});
    addRow(education, {paddingBottom:.33 *pdf.cm}).add('EDUCATION', { fontSize: 12, color:0x233655, textAlign: 'left', font: fonts.HelveticaBold });
    
    addRow(education).add('B.S. Major CIT & Minor CS.', { fontSize: 10, textAlign: 'left'  });
    addRow(education).add('Marketing Certificate', { fontSize: 10, textAlign: 'left' });
    addRow(education, {paddingTop:.16 *pdf.cm}).add('Utah Tech University, St George, UT', { fontSize: 9, textAlign: 'left' });
    addRow(education,{paddingTop:.16 *pdf.cm} ).add('September 2013 - May 2018', { fontSize: 9, textAlign: 'left' });
    
    const skills = overViewRow.cell().table({ widths: [null] });
    addRow(skills, {paddingBottom:.33 *pdf.cm}).add('Key Skills', { fontSize: 12,color:0x233655, font: fonts.HelveticaBold });
    addRow(skills, {paddingBottom:.16 *pdf.cm}).add('Software Engineering', { fontSize: 9, textAlign: 'left', });
    addRow(skills, {paddingBottom:.16 *pdf.cm}).add('Project Management', { fontSize: 9, textAlign: 'left' });
    addRow(skills, {paddingBottom:.16 *pdf.cm}).add('Web Development', { fontSize: 9, textAlign: 'left' });
    addRow(skills, {paddingBottom:.16 *pdf.cm}).add('Typescript, React, Go', { fontSize: 9, textAlign: 'left' });
    
    const profiles = overViewRow.cell().table({ widths: [null] });
    addRow(profiles, {paddingBottom:.33 *pdf.cm}).add('PROFILES', { fontSize: 12 , color:0x233655, font: fonts.HelveticaBold });
    addRow(profiles, {paddingBottom:.16 *pdf.cm}).add('github.com/th-m', { fontSize: 9, textAlign: 'left', link: 'https://github.com/th-m', });
    addRow(profiles, {paddingBottom:.16 *pdf.cm}).add('linkedin.com/in/thomasvaladez', { fontSize: 9, textAlign: 'left',link: 'https://www.linkedin.com/in/thomasvaladez', });
    addRow(profiles, {paddingBottom:.16 *pdf.cm}).add('twitter.com/ValadezThom', { fontSize: 9, textAlign: 'left',link: 'https://twitter.com/ValadezThom', });
    addRow(profiles, {paddingBottom:.16 *pdf.cm}).add('blog.th-m.codes', { fontSize: 9, textAlign: 'left',link: 'https://th-m.codes/', });
    

    doc
    .cell({ paddingLeft: 1 * pdf.cm, paddingBottom: 0.33 * pdf.cm })
    .text('PROFESSIONAL EXPERIENCE', {
      fontSize: 12,
      color:0x233655,
      alignment: 'left',
     
      font: fonts.HelveticaBold,
    });

    const kollaRow = doc
    .cell({paddingLeft:1*pdf.cm, paddingRight:1*pdf.cm})
    .table({ widths: [null, null], padding: .01 * pdf.cm, paddingTop: 0.5 * pdf.cm })
    .row();
    const kollaDetails = kollaRow.cell().table({ widths: [null]});
    addRow(kollaDetails, {paddingBottom:.16 *pdf.cm}).add('PRINCIPLE ENGINEER', { fontSize: 10 , color:0x233655, font: fonts.HelveticaBold });
    addRow(kollaDetails).add('Kolla - getkolla.com', { fontSize: 9, font: fonts.Helvetica, link:'https://www.getkolla.com/' });
    addRow(kollaDetails).add('Feb 2022 - Present', { fontSize: 9, font: fonts.Helvetica });
    const kollaSummary = kollaRow.cell().table({ widths: [null]});

    addRow(kollaSummary, {paddingBottom:.16 *pdf.cm}).add('Leveraged our Open API specs to generate type-safe CRUD operations, forms, and other utilities such as react providers and context and yup validators.', { fontSize: 9 , font: fonts.Helvetica });
    addRow(kollaSummary, {paddingBottom:.16 *pdf.cm}).add('Coordinated with and trained designer on a design systems. Extended MUI while drawing from the principles detailed in Refactoring UI', { fontSize: 9 , font: fonts.Helvetica });
    addRow(kollaSummary, {paddingBottom:.16 *pdf.cm}).add('Developed client interfaces: Admin Portal, White-labeled Marketplace, Embedded Marketplace. Developed backend systems on top of GCP: webhooks platform & billing receipts', { fontSize: 9 ,  font: fonts.Helvetica });
    
    const soundSculptRow = doc
    .cell({paddingLeft:1*pdf.cm, paddingRight:1*pdf.cm})
    .table({ widths: [null, null], padding: .01 * pdf.cm, paddingTop: 0.5 * pdf.cm})
    .row();

    const ssDetails = soundSculptRow.cell().table({ widths: [null]});
    addRow(ssDetails, {paddingBottom:.16 *pdf.cm}).add('CO-FOUNDER', { fontSize: 10 , color:0x233655, font: fonts.HelveticaBold });
    addRow(ssDetails).add('SoundSculpt - soundsculpt.app', { fontSize: 9, font: fonts.Helvetica, link:'https://soundsculpt.app/' });
    addRow(ssDetails).add('Oct 2021 - Present', { fontSize: 9, font: fonts.Helvetica });

    const ssSummary = soundSculptRow.cell().table({ widths: [null]});
    addRow(ssSummary, {paddingBottom:.16 *pdf.cm}).add('Created a platform for selling music generated by Javascript Audio API, currently we are averaging about 50 new users a week, while running on a zero cost infrastructure.', { fontSize: 9 , font: fonts.Helvetica });
    addRow(ssSummary, {paddingBottom:.16 *pdf.cm}).add('As a co-founder I wear many hats: engineer, designer, QA, marketer, SEO, and strategist. Doing whatever it takes to get this product off the ground.', { fontSize: 9 , font: fonts.Helvetica });
    
    
    const weaveRow = doc
    .cell({paddingLeft:1*pdf.cm, paddingRight:1*pdf.cm})
    .table({ widths: [null, null], padding: .01 * pdf.cm, paddingTop: 0.5 * pdf.cm})
    .row();

    const weaveDetails = weaveRow.cell().table({ widths: [null]});
    addRow(weaveDetails, {paddingBottom:.16 *pdf.cm}).add('ENGINEERING MANAGER', { fontSize: 10 , color:0x233655, font: fonts.HelveticaBold });
    addRow(weaveDetails).add('Weave - getweave.com', { fontSize: 9, font: fonts.Helvetica, link: 'https://www.getweave.com/' });
    addRow(weaveDetails).add('Oct 2018 - Feb 2022', { fontSize: 9, font: fonts.Helvetica });

    const weaveSummary = weaveRow.cell().table({ widths: [null]});
    addRow(weaveSummary, {paddingBottom:.16 *pdf.cm}).add('Led and managed multiple teams. Guide team through architecing solutions,  role as technical lead and manager was to facilitate and train. ', { fontSize: 9 , font: fonts.Helvetica });
    addRow(weaveSummary, {paddingBottom:.16 *pdf.cm}).add("Operated an agile process drawing from Ryan Singer's ShapeUp. Implemented SLOs and alerting using Promethues and Graphana. Introduced Accelerate Metrics to the team", { fontSize: 9 ,  font: fonts.Helvetica });
    addRow(weaveSummary, {paddingBottom:.16 *pdf.cm}).add('Refactored Automated Messaging architecture to handle 5+ million messages daily. Polished UI / UX to reduce erronous user configuration. Reducing total bug reports by 60%', { fontSize: 9 ,  font: fonts.Helvetica });
    addRow(weaveSummary, {paddingBottom:.16 *pdf.cm}).add("Extended Weave's ETL process to sync schedule data and funnel it into an internal schedule platform. This effort was to two fold: 1) Provide actionable features to automate customer life cycle 2) increase TAM by allowing non-integrated customers feature parity", { fontSize: 9 ,  font: fonts.Helvetica });
    
    doc
    .cell({ paddingLeft: 1 * pdf.cm, paddingBottom: 0.33 * pdf.cm })
    .text('ADDITIONAL INFO', {
      fontSize: 12,
      color:0x233655,
      alignment: 'left',
     
      font: fonts.HelveticaBold,
    });

    const additionalInfo = doc
    .cell({paddingLeft:1*pdf.cm, paddingRight:1*pdf.cm})
    .table({ widths: [null, null], padding: .01 * pdf.cm, paddingTop: 0.5 * pdf.cm, paddingBottom: .01 * pdf.cm })
    .row();
  
    const meetup = additionalInfo.cell().table({ widths: [null]});
    // addRow(meetup, {paddingBottom:.33 *pdf.cm}).add('Run Local Meet Up', { fontSize: 12, color:0x233655, textAlign: 'left', font: fonts.HelveticaBold });
    
    addRow(meetup).add('Organize & Run Local Meet Up', { fontSize: 10, textAlign: 'left'  });
    addRow(meetup).add('Saint George Web Developers Meetup', { fontSize: 9, textAlign: 'left' });
    addRow(meetup).add('200+ total members w/ about 30 active', { fontSize: 9, textAlign: 'left' });
    addRow(meetup ).add('July 2019 - Present', { fontSize: 9, textAlign: 'left' });
   

    const buffer = await doc.asBuffer();
    return new Response(buffer.toString(), {
      status: 200,
      headers: { 'content-type': `application/pdf` },
    });
  } catch (error: unknown) {
    return new Response(`Something went wrong in pdf-resource.pdf route!: ${error as string}`, {
      status: 501,
      statusText: 'Server error',
    });
  }
};
