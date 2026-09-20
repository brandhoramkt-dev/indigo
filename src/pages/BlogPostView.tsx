import { useParams, useNavigate } from "react-router-dom";
import { useFirestoreCollection } from "../lib/hooks";
import { BlogPost } from "../types";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";

export default function BlogPostView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: posts, loading } = useFirestoreCollection<BlogPost>("blogPosts");

  const post = posts.find((p) => p.slug === slug || p.id === slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-brand border-t-orange-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-display font-black text-indigo-brand uppercase mb-4">Artículo no encontrado</h1>
        <button onClick={() => navigate("/")} className="text-orange-brand font-bold flex items-center gap-2 hover:underline">
          <ArrowLeft size={16} /> Volver a inicio
        </button>
      </div>
    );
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.summary;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{title} | Indigo Coffee Hub</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={post.imageUrl} />
      </Helmet>

      <div className="relative h-96 md:h-[60vh] w-full">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-black/20 to-black/60"></div>
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 p-4 bg-white/20 hover:bg-white text-white hover:text-indigo-brand rounded-full backdrop-blur-md transition-all z-10 shadow-2xl flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Atrás
        </button>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 -mt-20 relative z-10 bg-white rounded-t-[3rem] shadow-2xl w-full">
        <span className="text-orange-brand font-bold tracking-widest text-xs uppercase mb-4 block">
          {post.publishedAt?.toDate ? new Date(post.publishedAt.toDate()).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </span>
        <h1 className="text-5xl md:text-7xl font-extenda font-black text-indigo-brand uppercase mb-8 leading-none tracking-tighter">{post.title}</h1>
        
        <div className="prose prose-lg md:prose-xl prose-indigo max-w-none text-gray-600 font-serif leading-relaxed whitespace-pre-wrap break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node, ...props}) => <a {...props} className="text-indigo-brand font-bold underline hover:text-orange-brand transition-colors" target="_blank" rel="noopener noreferrer" />,
              strong: ({node, ...props}) => <strong {...props} className="font-black text-indigo-dark" />,
              em: ({node, ...props}) => <em {...props} className="italic text-gray-500" />
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </main>

      <Footer />
    </div>
  );
}
