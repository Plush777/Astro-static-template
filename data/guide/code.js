export const forLoopCode = `---
const array = ["Dog", "Cat", "Platypus"];
---
<ul>
  {array.map(() => {
    return(
      <li>{item}</li>
    )
  })}
</ul>
`;

export const componentGuideCode = `/* src/components/layout/Nav.astro */

---
const menus = [
    {
        name: 'Home', 
        path: '/'
    },
    {
        name: 'Guide', 
        path: '/guide'
    },
    {
        name: 'Contact',
        path: 'contact'
    }
];

const currentPath = Astro.url.pathname;
const { slug } = Astro.props;
---

<nav class="nav">
    <ul class="nav-list">
        {
            menus.map((menu) => {
            const href = menu.path;
            const isActive = currentPath === href;

            return (
                <li class="nav-item">
                    <a href={href} class={\`nav-item-text \${isActive ? "nav-item-text-active" : ""}\`}>
                       {menu.name}
                    </a>
                </li>
            );
            })
        }
    </ul>
</nav>
`;
