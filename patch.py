import os
for f in ["src/Event.tsx", "src/Team.tsx", "src/Help.tsx"]:
    with open(f, 'r') as file:
        content = file.read()
    
    name = f.split('/')[-1].split('.')[0]
    content = content.replace(f'function {name}() {{', f'function {name}({{ isDashboard = false }}: {{ isDashboard?: boolean }}) {{')
    
    content = content.replace('<nav ', '{!isDashboard && (\n        <nav ')
    content = content.replace('</nav>', '</nav>\n      )}')
    content = content.replace('<Footer />', '{!isDashboard && <Footer />}')
    
    with open(f, 'w') as file:
        file.write(content)
