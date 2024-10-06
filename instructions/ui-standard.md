# 2Click Broker UI Style Guide

## Layout Structure
1. Use a consistent layout wrapper for all pages:
   - Sidebar navigation on the left
   - Header at the top with user menu and quick actions
   - Main content area with proper padding and max-width

2. Implement a responsive grid system using Tailwind CSS classes

## Typography
1. Use a consistent font hierarchy:
   - Headings: text-2xl to text-5xl, font-bold, text-gray-900
   - Subheadings: text-xl, font-semibold, text-gray-700
   - Body text: text-base, text-gray-600
   - Small text: text-sm, text-gray-500

2. Maintain consistent line heights and letter spacing

## Color Scheme
1. Primary color: indigo-600 (use for primary actions, links)
2. Secondary color: emerald-500 (use for success states, positive actions)
3. Accent color: amber-500 (use for warnings, important notes)
4. Error color: red-500 (use for error states, destructive actions)
5. Background colors:
   - Main background: bg-gray-50
   - Card/section backgrounds: bg-white
   - Alternate sections: bg-gray-100

## Components
1. Cards:
   - Use shadow-sm for subtle elevation
   - Rounded corners (rounded-lg)
   - Consistent padding (p-6)

2. Buttons:
   - Primary: bg-indigo-600 hover:bg-indigo-700 text-white
   - Secondary: bg-white border border-gray-300 text-gray-700 hover:bg-gray-50
   - Danger: bg-red-600 hover:bg-red-700 text-white

3. Forms:
   - Input fields: border border-gray-300 rounded-md p-2
   - Labels: text-sm font-medium text-gray-700
   - Error messages: text-sm text-red-600

4. Tables:
   - Striped rows: even:bg-gray-50
   - Hover effect: hover:bg-gray-100
   - Consistent padding for cells

5. Navigation:
   - Active state: bg-indigo-700 text-white
   - Hover state: bg-indigo-600 text-white

## Charts and Data Visualization
1. Use a consistent color palette derived from the main color scheme
2. Implement responsive designs that adapt to different screen sizes
3. Include proper legends and labels for clarity
4. Use animations sparingly to enhance user experience

## Spacing and Alignment
1. Use Tailwind's spacing utilities consistently (e.g., m-4, p-6)
2. Maintain consistent gaps between sections (e.g., space-y-8)
3. Align elements properly within their containers

## Accessibility
1. Ensure sufficient color contrast for text readability
2. Use proper ARIA labels for interactive elements
3. Implement keyboard navigation support

## Responsive Design
1. Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) to adjust layouts
2. Ensure all features are usable on mobile devices
3. Implement a mobile-friendly navigation menu

## Loading States and Transitions
1. Use consistent loading spinners or skeletons
2. Implement smooth transitions for state changes (e.g., hover effects)

## Icons
1. Use Lucide Icons consistently throughout the application
2. Maintain consistent icon sizes and colors

Remember to apply these guidelines consistently across all pages and components to create a cohesive and professional-looking user interface.