import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const CategoryNav: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const links = [
    { href: "/posts", label: "Posts" },
    { href: "/archive", label: "Archive" },
    { href: "/tutorials", label: "Tutorials" },
  ]
  return (
    <nav class={classNames(displayClass, "category-nav")}>
      <ul>
        {links.map(({ href, label }) => (
          <li>
            <a href={href} class={slug.startsWith(href.slice(1)) ? "active" : ""}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

CategoryNav.css = `
.category-nav {
  background: transparent;
  margin-top: 1.5rem;
}

.category-nav ul {
  padding: 0;
  margin: 0;
}

.category-nav li {
  margin-bottom: 0.75rem;
  padding: 0;
}

.category-nav a {
  display: block;
  padding: 0.75rem 1rem;
  background-color: rgba(52, 152, 219, 0.1);
  color: white;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid white;
  text-decoration: none;
}

.category-nav a:hover {
  background-color: var(--secondary);
  color: var(--light);
}

.category-nav a.active {
  background-color: var(--secondary);
  color: var(--light);
}
`

export default (() => CategoryNav) satisfies QuartzComponentConstructor
