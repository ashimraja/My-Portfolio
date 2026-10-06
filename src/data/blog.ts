import type { BlogBlock, BlogContent } from '@/types'

// Small helpers keep the article below readable: one line per block.
const p = (text: string): BlogBlock => ({ type: 'paragraph', text })
const h = (text: string): BlogBlock => ({ type: 'heading', text })
const h3 = (text: string): BlogBlock => ({ type: 'subheading', text })
const ul = (...lines: string[]): BlogBlock => ({ type: 'list', text: lines.join('\n') })
const code = (text: string, language: string, filename?: string): BlogBlock => ({ type: 'code', text, language, caption: filename })

const MEDIUM = 'https://medium.com/@silverskytechnology/why-react-native-apps-get-bloated-and-how-to-fix-them-e97dbc9cc9ee'
const COVER = 'https://miro.medium.com/v2/resize:fit:1024/1*_y_mBeGpK-6nhI5We_xw_A.jpeg'

/** Articles live in the cloud (dashboard → Blog). Until something is saved there, these built-in posts are shown. */
export const blog: BlogContent = {
  intro: { kicker: 'Writing', title: 'Notes from the build.' },
  mediumProfile: 'https://medium.com/@silverskytechnology',
  items: [
    {
      slug: 'why-react-native-apps-get-bloated',
      title: 'Why React Native Apps Get Bloated — and How to Fix Them',
      excerpt: 'Your APK or AAB just hit 80MB+. Nine tested, production-ready techniques to shrink a React Native app without giving up a single feature.',
      date: '2025-12-17',
      tags: ['React Native', 'Performance', 'Android', 'Best Practices'],
      cover: COVER,
      mediumUrl: MEDIUM,
      blocks: [
        p('You’ve built an amazing React Native app, performance is snappy, and your UI is gorgeous. But then you see the APK/AAB size: **80MB+**. Ouch. That number is more than just a number, it’s a silent killer of your install rates, a drag on your user experience on slow networks, and a major factor in uninstalls, especially for Android users.'),
        p('We’re going through 9 tested, production-ready techniques to get your app down to a lean, mean, install-machine without sacrificing a single feature.'),

        h('Why App Size Matters in Production'),
        p('Before diving into solutions, let’s understand the real-world impact:'),
        ul('Lower install conversion on Play Store', 'Slower downloads on poor networks', 'Higher uninstall rates', 'Users avoiding updates due to storage constraints'),

        h('Common Reasons React Native Apps Are Large'),
        ul('Unoptimized assets (images, fonts, videos)', 'Unused native dependencies', 'Debug code shipped in production', 'Large JavaScript bundles', 'Multiple CPU architectures bundled together', 'Duplicate libraries from poor dependency management'),
        p('Let’s fix them one by one.'),

        h('1. Enable Proguard & R8 (Android)'),
        p('Many production apps ship with unused Java/Kotlin code.'),
        h3('Enable R8 (Recommended)'),
        p('In `android/gradle.properties`:'),
        code('android.enableR8=true', 'properties', 'android/gradle.properties'),
        p('In `android/app/build.gradle`:'),
        code('minifyEnabled true\nshrinkResources true', 'gradle', 'android/app/build.gradle'),
        p('**Benefits:**'),
        ul('Removes unused classes', 'Shrinks bytecode', 'Reduces APK/AAB size significantly'),
        p('Typical reduction: **5–20 MB**'),

        h('2. Use Android App Bundles (AAB)'),
        p('If you’re still shipping APKs, you’re already losing.'),
        h3('Switch to AAB'),
        code('cd android\n./gradlew bundleRelease', 'bash'),
        p('**Why AAB helps:**'),
        ul('Delivers only required resources per device', 'Splits by ABI, density, and language'),
        p('Size reduction: **20–40% for Android users**'),

        h('3. Reduce Native Architectures (ABI Splits)'),
        p('By default, React Native includes all CPU architectures.'),
        h3('Enable ABI splits'),
        p('In `android/app/build.gradle`:'),
        code('splits {\n  abi {\n    enable true\n    reset()\n    include "armeabi-v7a", "arm64-v8a"\n    universalApk false\n  }\n}', 'gradle', 'android/app/build.gradle'),

        h('4. Optimize Images & Assets'),
        p('**Common mistake:** shipping raw PNGs straight from design tools.'),
        p('**Best practices:**'),
        ul('Use WebP instead of PNG/JPEG', 'Compress images using tools like TinyPNG and ImageOptim', 'Avoid bundling unused images'),
        p('For icons:'),
        ul('Prefer vector icons', 'Remove unused glyphs from icon fonts'),
        p('Savings: **huge in image-heavy apps**'),

        h('5. Remove Unused Dependencies'),
        p('Production apps accumulate dead dependencies over time.'),
        h3('Audit dependencies'),
        code('npm ls', 'bash'),
        p('Ask:'),
        ul('Is this library still used?', 'Is it worth the native size cost?'),
        p('Common heavy libraries:'),
        ul('Multiple date libraries', 'Redundant UI libraries', 'Analytics SDKs added “just in case”'),
        p('Savings: varies, but often significant'),

        h('6. Disable Debug & Dev Tools in Production'),
        p('Make sure these are not shipped:'),
        ul('React DevTools', 'Flipper', 'Console logs', 'Debug-only native code'),
        h3('Disable Flipper (Android)'),
        code('debugImplementation "com.facebook.flipper:flipper"\nreleaseImplementation ""', 'gradle'),
        p('Savings: **several MBs** + runtime benefits'),

        h('7. Enable Hermes Engine'),
        p('Hermes is a game changer for both performance and size.'),
        h3('Enable Hermes'),
        p('In `android/app/build.gradle`:'),
        code('enableHermes: true', 'gradle', 'android/app/build.gradle'),
        p('**Benefits:**'),
        ul('Smaller JS bundle', 'Faster startup', 'Lower memory usage'),
        p('Savings: **5–10 MB**'),

        h('8. Reduce JavaScript Bundle Size'),
        p('**Techniques:**'),
        ul('Code splitting', 'Lazy loading screens', 'Remove unused imports', 'Avoid large utility libraries'),
        p('Example:'),
        code("import debounce from 'lodash/debounce';", 'js'),
        p('Instead of:'),
        code("import _ from 'lodash';", 'js'),
        p('Smaller JS = faster app + smaller binary.'),

        h('9. Fonts: The Silent App Size Killer'),
        p('**Common issue:** bundling entire font families for a few characters.'),
        p('**Fix:**'),
        ul('Use only required font weights', 'Subset fonts', 'Remove unused custom fonts'),
        p('Savings: **1–5 MB**'),

        h('Conclusion'),
        p('Reducing app size isn’t a one-time task, it’s a continuous production discipline.'),
        p('Teams that actively monitor app size:'),
        ul('Ship faster updates', 'Improve user trust', 'Increase install rates', 'Reduce churn'),
        p('If you treat app size as a first-class metric, your React Native app will scale better in the real world.'),
        p('If this post helped you, drop a comment, share it with your team, or bookmark it for later. Your feedback keeps content like this coming.'),
        p('Brought to you by MD Ashim Raja from the Silversky Technology crew. Curious what else we’re building? Explore more at [silverskytechnology.com](https://silverskytechnology.com).'),
      ],
    },
  ],
}
