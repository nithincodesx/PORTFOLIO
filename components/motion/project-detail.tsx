"use client";

import { useId } from "react";

export type ProjectDetailProject = {
  num: string;
  title: string;
  tags: string[];
  year: string;
  url: string;
  desc: string;
};

export type ProjectDetailImage = {
  src: string;
  alt: string;
};

export type ProjectDetailProps = {
  project: ProjectDetailProject;
  image?: ProjectDetailImage;
  open: boolean;
};

export function ProjectDetail({ project, image, open }: ProjectDetailProps) {
  const id = useId().replace(/:/g, "");
  const descriptionId = `project-detail-${id}-description`;

  return (
    <>
      <style>{`
        .project-detail {
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          color: #fff;
        }

        .project-detail__inner {
          min-height: 0;
          overflow: hidden;
        }

        .project-detail__layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(12rem, 24rem);
          gap: clamp(1.5rem, 5vw, 5rem);
          align-items: start;
          padding: clamp(1.5rem, 4vw, 3.5rem) clamp(1.25rem, 5vw, 6rem);
        }
        .project-detail[data-has-image='false'] .project-detail__layout {
          grid-template-columns: minmax(0, 1fr);
        }

        .project-detail__copy {
          display: grid;
          gap: 1.5rem;
          min-width: 0;
        }

        .project-detail__eyebrow,
        .project-detail__tags,
        .project-detail__link {
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
        }

        .project-detail__eyebrow {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin: 0;
          color: #f5a623;
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          line-height: 1.4;
        }

        .project-detail__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          line-height: 1.4;
        }

        .project-detail__tag {
          padding: 0.35rem 0.55rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .project-detail__description {
          max-width: 44rem;
          margin: 0;
          color: rgba(255, 255, 255, 0.56);
          font-size: clamp(0.95rem, 1.5vw, 1.15rem);
          line-height: 1.75;
        }

        .project-detail__link {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 0.55rem;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid rgba(245, 166, 35, 0.5);
          color: #f5a623;
          font-size: 0.64rem;
          letter-spacing: 0.13em;
          line-height: 1.4;
          text-decoration: none;
          transition: border-color 220ms ease, color 220ms ease;
        }

        .project-detail__link:hover,
        .project-detail__link:focus-visible {
          border-color: #f5a623;
          color: #fff;
        }

        .project-detail__link:focus-visible {
          outline: 1px solid #f5a623;
          outline-offset: 0.35rem;
        }

        .project-detail__arrow {
          display: inline-block;
          font-size: 1rem;
          line-height: 0.8;
          transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .project-detail__link:hover .project-detail__arrow,
        .project-detail__link:focus-visible .project-detail__arrow {
          transform: translate(0.15rem, -0.15rem);
        }

        .project-detail__media {
          position: relative;
          overflow: hidden;
          margin: 0;
          border: 1px solid rgba(245, 166, 35, 0.42);
          background: #0c0c0c;
          box-shadow: 0.8rem 0.8rem 0 rgba(245, 166, 35, 0.08);
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 450ms ease, transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .project-detail__media::after {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            130deg,
            transparent 35%,
            rgba(245, 166, 35, 0.16),
            transparent 65%
          );
          content: '';
        }

        .project-detail__image {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: contain;
          transform: scale(1.025);
          transition: transform 850ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .project-detail[data-open='true'] .project-detail__media {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 80ms;
        }
        .project-detail[data-open='true'] .project-detail__image {
          transform: scale(1);
        }

        @media (max-width: 680px) {
          .project-detail__layout {
            grid-template-columns: 1fr;
          }

          .project-detail__media { width: min(100%, 28rem); }
        }

        @media (prefers-reduced-motion: reduce) {
          .project-detail,
          .project-detail__media,
          .project-detail__image,
          .project-detail__link,
          .project-detail__arrow {
            animation: none;
            transition: none;
          }
        }
      `}</style>

      <article
        className="project-detail"
        data-open={open}
        data-has-image={Boolean(image)}
        aria-label={project.title}
        aria-describedby={descriptionId}
      >
        <div className="project-detail__inner">
          <div className="project-detail__layout">
            <div className="project-detail__copy">
              <p className="project-detail__eyebrow">
                <span>{project.num}</span>
                <span aria-hidden="true">/</span>
                <span>{project.year}</span>
              </p>
              {project.tags.length > 0 && (
                <ul className="project-detail__tags" aria-label="Project technologies">
                  {project.tags.map((tag) => (
                    <li className="project-detail__tag" key={tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              <p id={descriptionId} className="project-detail__description">
                {project.desc}
              </p>

              <a
                className="project-detail__link"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title} project in a new tab`}
              >
                Open project
                <span className="project-detail__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>

            {image && (
              <figure className="project-detail__media">
                <img
                  className="project-detail__image"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />
              </figure>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
