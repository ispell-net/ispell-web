/*
 * @Date: 2025-11-01 22:31:03
 * @LastEditTime: 2025-11-06 21:19:04
 * @Description: 隐私政策页面 (已适配 Sticky 布局)
 */
import React from 'react';
import type { Metadata } from 'next';

// 为这个页面设置元数据，有利于SEO
export const metadata: Metadata = {
  title: '隐私政策 - iSpell 爱拼词',
  description: 'iSpell (爱拼词) 平台的隐私政策。',
};

// 定义一个可重用的标题组件，以保持样式统一
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
    {children}
  </h2>
);

// 定义一个可重用的段落组件
const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
    {children}
  </p>
);

// 定义一个可重用的列表项组件
const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="text-gray-700 dark:text-gray-300 leading-relaxed ml-4">
    {children}
  </li>
);

/**
 * iSpell 隐私政策页面
 * 路径: /privacy
 */
export default function PrivacyPolicyPage() {
  return (
    // 修改点：
    // 1. <main> 改为 <div> (因为 layout 中已有 <main>)
    // 2. 移除 min-h-screen (layout 已处理)
    // 3. 移除 mt-12
    // 4. 添加 w-full
    <div className="w-full py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面主标题 */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          隐私政策
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          最后更新于：2025年11月1日
        </p>

        <Paragraph>
          感谢您使用 iSpell
          (爱拼词)！我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
        </Paragraph>
        <Paragraph>
          本《隐私政策》（以下简称“本政策”）旨在说明我们如何收集、使用、存储和共享您的个人信息，以及您如何访问、更新、删除和保护这些信息。
        </Paragraph>

        {/* --- 1. 我们如何收集和使用您的信息 --- */}
        <SectionTitle>1. 我们如何收集和使用您的信息</SectionTitle>
        <Paragraph>
          在您使用我们的服务时，我们会遵循“最少够用”原则，收集和使用以下与您相关的信息：
        </Paragraph>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <ListItem>
            <strong>您提供的信息</strong>
            ：当您注册账户时，您需要提供您的**电子邮箱**作为登录名。当您使用密码登录时，您需要设置密码，我们将对您的密码进行**单向哈希加密**存储。
          </ListItem>
          <ListItem>
            <strong>第三方服务信息</strong>
            ：如果您选择使用第三方账户（如微信、QQ、Google、GitHub）登录，您将授权我们获取您在该第三方平台注册的公开信息（如**昵称、头像**）。
          </ListItem>
          <ListItem>
            <strong>服务使用信息</strong>
            ：为了提供核心的单词记忆功能，我们会记录您的**学习数据**，包括您的单词书选择、学习计划设置（如每日词数）、单词掌握状态和复习进度。
          </ListItem>
          <ListItem>
            <strong>设备与技术信息</strong>：我们可能会自动收集某些技术信息，如
            IP 地址、浏览器类型、操作系统。我们使用 `localStorage` 或
            `sessionStorage` 来存储您的认证状态（如果您选择“记住我”，则使用
            `localStorage`）和应用偏好（如主题设置）。
          </ListItem>
        </ul>

        {/* --- 2. 我们如何使用您的信息 --- */}
        <SectionTitle>2. 我们如何使用您的信息</SectionTitle>
        <Paragraph>
          我们严格遵守法律法规的规定及与用户的约定，将收集的信息用于以下用途：
        </Paragraph>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <ListItem>
            <strong>提供核心服务</strong>
            ：用于身份验证（登录、注册、重置密码），以及存储和同步您的学习进度。
          </ListItem>
          <ListItem>
            <strong>发送重要通知</strong>
            ：当您注册或重置密码时，我们需要使用您的电子邮箱，通过**腾讯云**等第三方服务商向您发送**验证码**。
          </ListItem>
          <ListItem>
            <strong>维护与改进</strong>
            ：用于分析我们服务的使用情况，以排查故障、改进功能和用户体验。
          </ListItem>
          <ListItem>
            <strong>安全保障</strong>
            ：用于预防、发现、调查欺诈、危害安全、非法或违反与我们或关联方协议、政策或规则的行为，以保护您、其他用户或我们的合法权益。
          </ListItem>
        </ul>

        {/* --- 3. 信息的共享、转让、公开披露 --- */}
        <SectionTitle>3. 信息的共享、转让、公开披露</SectionTitle>
        <Paragraph>
          我们**不会**将您的个人信息出售给任何公司、组织或个人。
        </Paragraph>
        <Paragraph>我们仅会在以下情况下，共享您的个人信息：</Paragraph>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <ListItem>
            <strong>获得您的明确同意后</strong>
            ：在获得您的明确同意后，我们会与其他方共享您的个人信息。
          </ListItem>
          <ListItem>
            <strong>与授权合作伙伴共享</strong>
            ：仅为实现本政策中声明的目的，我们的某些服务将由授权合作伙伴提供（例如，腾讯云的短信和邮件服务）。我们仅会出于合法、正当、必要、特定、明确的目的共享您的信息，并且只会共享提供服务所必要的信息。
          </ListItem>
          <ListItem>
            <strong>法律法规要求</strong>
            ：根据法律、法规、法律程序的要求或政府主管部门的强制性要求，我们可能会对外共享您的个人信息。
          </ListItem>
        </ul>

        {/* --- 4. 您的权利 --- */}
        <SectionTitle>4. 您的权利</SectionTitle>
        <Paragraph>
          按照中国相关的法律、法规、标准，我们保障您对自己的个人信息行使以下权利：
        </Paragraph>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <ListItem>
            <strong>访问和更正</strong>
            ：您有权访问和更正您的账户信息（例如昵称、头像）。
          </ListItem>
          <ListItem>
            <strong>删除</strong>
            ：您可以通过“退出登录”清除您在本地设备上的会话信息
            (`sessionStorage`)。如果您勾选了“记住我”，您也需要手动清除浏览器
            `localStorage` 中的数据。
          </ListItem>
          <ListItem>
            <strong>注销账户</strong>
            ：您随时可以联系我们申请注销账户。在收到您的申请后，我们将停止为您提供服务，并删除您的个人信息或对其进行匿名化处理（法律法规另有规定的除外）。
          </ListItem>
        </ul>

        {/* --- 5. 信息存储与安全 --- */}
        <SectionTitle>5. 信息存储与安全</SectionTitle>
        <Paragraph>
          我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。
        </Paragraph>
        <Paragraph>
          例如，我们对您的**密码**使用 **Bcrypt 哈希加密**
          进行单向加密存储，确保即使数据库泄露，您的原始密码也不会被获取。
        </Paragraph>

        {/* --- 6. 儿童隐私 --- */}
        <SectionTitle>6. 儿童隐私</SectionTitle>
        <Paragraph>
          我们的服务主要面向成年人。如果没有父母或监护人的同意，儿童（我们认为是指
          14 周岁以下的任何人）不应创建自己的用户账户。
        </Paragraph>

        {/* --- 7. 政策变更 --- */}
        <SectionTitle>7. 政策变更</SectionTitle>
        <Paragraph>
          我们保留随时修改本政策的权利。修改后的政策将在本页面公布，并取代旧版本。我们建议您定期查看本政策。您在政策变更后继续使用本服务，即视为您接受修改后的政策。
        </Paragraph>

        {/* --- 8. 联系我们 --- */}
        <SectionTitle>8. 联系我们</SectionTitle>
        <Paragraph>
          如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
        </Paragraph>
        <Paragraph>
          电子邮件：
          <a
            href="mailto:privacy@ispell.com"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            privacy@ispell.com
          </a>
        </Paragraph>
      </div>
    </div> // <-- 修改点： </main> 改为 </div>
  );
}
