import { useEffect, useState, useRef } from "react";
import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { v4 as uuid } from "uuid";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
// import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { updatePost } from "../../src/graphql/mutations";
import { getPost } from "../../src/graphql/queries";

function editPost() {
  const [post, setPost] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [localImage, setLocalImage] = useState(null);
  const fileInput = useRef(null);
  const router = useRouter();
  console.log(router.query);
  const { id } = router.query;

  useEffect(() => {
    fetchPost();
    async function fetchPost() {
      if (!id) return;
      const postData = await API.graphql({
        query: getPost,
        variables: { id },
      });
      setPost(postData.data.getPost);
      if (postData.data.getPost.coverImage) {
        updateCoverImage(postData.data.getPost.coverImage);
      }
    }
  }, [id]);
  if (!post) return;
  async function updateCoverImage(coverImage) {
    const imageKey = await Storage.get(coverImage);
    setCoverImage(imageKey);
  }
  async function uploadImage() {
    fileInput.current.click();
  }
  function handleChange(e) {
    const fileInput = e.target.files[0];
    if (!fileInput) return;
    //current img replace with fileInput
    setCoverImage(fileInput);
    //to view what we uploaded
    setLocalImage(URL.createObjectURL(fileInput));
  }
  function onChange(e) {
    console.log(e);
    setPost(() => ({ ...post, [e.target.name]: e.target.value }));
    console.log(setPost);
  }
  const { title, content } = post;
  async function UpdateCurrentPost() {
    if (!title || !content) return;
    const postUpdated = {
      id,
      content,
      title,
    };
    if (coverImage && localImage) {
      const fileName = `${coverImage.name}_${uuid()}`;
      postUpdated.coverImage = fileName;
      await Storage.put(fileName, coverImage);
    }

    console.log("postUpdated" + postUpdated);
    await API.graphql({
      query: updatePost,
      variables: { input: postUpdated },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push("/allMyPosts");
  }
  return (
    <div>
      <h1
        className="text-3xl font-semibold 
      tracking-wide mt-6 mb-2"
      >
        Edit Post
      </h1>
      {coverImage && (
        <img className="mt-4" src={localImage ? localImage : coverImage} />
      )}
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={post.title}
        className="border-b pb-2 text-lg my-4 
      focus:outline-none w-full font-light 
      text-gray-500 placeholder-gray-500 y-2"
      />
      <SimpleMDE
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <input
        type="file"
        ref={fileInput}
        className="absolute w-0 h-0"
        onChange={handleChange}
      />
      <button
        onClick={uploadImage}
        type="button"
        className="mb-4 bg-blue-600 text-white
        font-semibold px-8 py-2 rounded-lg"
      >
        Upload Image
      </button>

      <button
        onClick={UpdateCurrentPost}
        type="button"
        className="mb-4 bg-blue-600 text-white
        font-semibold px-8 py-2 rounded-lg"
      >
        Update Post
      </button>
    </div>
  );
}
export default editPost;
