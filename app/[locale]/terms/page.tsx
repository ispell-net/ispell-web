/*
 * @Date: 2025-11-01 22:31:03
 * @LastEditTime: 2025-11-02 22:01:23
 * @Description: 服务条款页面 (已适配 Sticky 布局)
 */
import React from 'react';
import type { Metadata } from 'next';

// 为这个页面设置元数据，有利于SEO
export const metadata: Metadata = {
  title: '服务条款 - iSpell 爱拼词',
  description: 'iSpell (爱拼词) 平台的服务条款。',
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
  <li className="text-gray-700 dark:text-gray-300 leading-relaxed">
    {children}
  </li>
);

/**
 * iSpell 服务条款页面
 * 路径: /terms
 */
export default function TermsPage() {
  return (
    // 修改点：
    // 1. <main> 改为 <div> (因为 layout 中已有 <main>)
    // 2. 移除 min-h-screen (layout 已处理)
    // 3. 移除 mt-12
    // 4. 添加 w-full
    <div className="w-full py-12">
      <div className="max-w-4xl  mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面主标题 */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          服务条款
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          最后更新于：2025年11月1日
        </p>

        <Paragraph>
          欢迎您使用 iSpell
          (爱拼词)！为了您能更好地使用本平台服务，请您务必仔细阅读并透彻理解本《服务条款》（以下简称“本条款”）。
        </Paragraph>
        <Paragraph>
          当您注册、登录、使用本服务时，即表示您已充分阅读、理解并接受本条款的全部内容，并同意受本条款的约束。
        </Paragraph>

        {/* --- 1. 账户注册 --- */}
        <SectionTitle>1. 账户注册与使用</SectionTitle>
        <Paragraph>
          您确认，在您开始注册程序或使用本服务前，您应当具备中华人民共和国法律规定的与您行为相适应的民事行为能力。
        </Paragraph>
        <Paragraph>
          您有责任妥善保管您的账户信息（包括邮箱）和密码。您应对您账户下的所有活动负全部法律责任。
        </Paragraph>
        <Paragraph>
          您同意在使用本服务时，提供真实、准确、即时、完整的注册信息，并及时更新。
        </Paragraph>

        {/* --- 2. 服务内容 --- */}
        <SectionTitle>2. 服务内容</SectionTitle>
        <Paragraph>iSpell 是一个语言学习平台，我们提供包括但不限于：</Paragraph>
        <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
          <ListItem>单词书浏览与选择；</ListItem>
          <ListItem>个性化学习计划（按天数、按词数）的创建与管理；</ListItem>
          <ListItem>基于智能复习算法（SRS）的单词记忆与拼写练习；</ListItem>
          <ListItem>
            通过第三方服务（微信、QQ、Google、GitHub）进行认证登录。
          </ListItem>
        </ul>
        <Paragraph>
          我们目前**免费**提供基础服务，但保留未来对部分或全部服务收取费用的权利。任何收费变更，我们将提前通过公告或邮件通知您。
        </Paragraph>

        {/* --- 3. 用户行为规范 --- */}
        <SectionTitle>3. 用户行为规范</SectionTitle>
        <Paragraph>您在使用本服务时不得利用本服务从事以下行为：</Paragraph>
        <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
          <ListItem>
            发布、传送、传播、储存违反国家法律、危害国家安全统一、社会稳定、公序良俗、社会公德以及任何不当、侮辱、诽谤、淫秽、暴力内容；
          </ListItem>
          <ListItem>
            侵害他人名誉权、肖像权、知识产权、商业秘密等合法权利；
          </ListItem>
          <ListItem>
            使用任何爬虫 (Scraper)、机器人 (Bot)
            或其他自动化手段访问或抓取本平台数据；
          </ListItem>
          <ListItem>
            对本平台进行反向工程、反向汇编、反向编译，或者以其他方式试图发现本平台的源代码；
          </ListItem>
          <ListItem>其他一切违反法律法规规定的行为。</ListItem>
        </ul>

        {/* --- 4. 知识产权 --- */}
        <SectionTitle>4. 知识产权</SectionTitle>
        <Paragraph>
          本平台（包括 "iSpell"
          品牌、Logo、图标、软件、界面设计、学习内容等）的全部知识产权，均归本平台所有者合法拥有。
        </Paragraph>
        <Paragraph>
          未经书面许可，您不得以任何形式复制、修改、传播、销售或（反向）工程我们的任何服务或软件。
        </Paragraph>

        {/* --- 5. 第三方服务 --- */}
        <SectionTitle>5. 第三方服务</SectionTitle>
        <Paragraph>
          本服务可能包含指向第三方网站或服务（例如，微信、QQ、Google、GitHub
          OAuth认证）的链接。您理解并同意，这些第三方服务不由我们控制，我们对其内容、隐私政策或做法不承担任何责任。
        </Paragraph>

        {/* --- 6. 免责声明 --- */}
        <SectionTitle>6. 免责声明与责任限制</SectionTitle>
        <Paragraph>
          本服务按“现状”和“可用”的基础提供。我们不保证服务一定能满足您的所有要求，也不保证服务不会中断、完全安全或没有错误。
        </Paragraph>
        <Paragraph>
          在法律允许的最大范围内，iSpell
          对您因使用（或无法使用）本服务而导致的任何直接、间接、偶然、特殊或惩罚性损害，不承担任何责任。
        </Paragraph>

        {/* --- 7. 条款变更 --- */}
        <SectionTitle>7. 条款变更</SectionTitle>
        <Paragraph>
          我们保留随时修改本条款的权利。修改后的条款将在本页面公布，并取代旧版本。我们建议您定期查看本条款。您在条款变更后继续使用本服务，即视为您接受修改后的条款。
        </Paragraph>

        {/* --- 8. 联系我们 --- */}
        <SectionTitle>8. 联系我们</SectionTitle>
        <Paragraph>
          如果您对本条款有任何疑问，请通过以下方式联系我们：
        </Paragraph>
        <Paragraph>
          电子邮件：
          <a
            href="mailto:support@ispell.com"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            support@ispell.com
          </a>
        </Paragraph>
      </div>
    </div> // <-- 修改点： </main> 改为 </div>
  );
}
