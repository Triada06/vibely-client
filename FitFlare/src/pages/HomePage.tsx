import "../App.css";
import CardComponent from "../components/CardComponent";
export default function HomePage() {
  return (
    <>
      <div className="md:ml-72 md:p-4 text-[#2E2E2E] dark:text-[#EAEAEA]">
        <CardComponent
          username={"nizami"}
          avatarUrl={
            "https://fitcheckstorage.blob.core.windows.net/fitflare/763870cd-b4cb-49db-9e2a-95ff8ac4efd6 - Levi.jpg?sv=2025-05-05&se=2025-05-12T07%3A28%3A59Z&sr=b&sp=r&sig=6ge9wPxPLz4GF4cO%2F80kzhNcj%2FXM62mqqBtPqwsre70%3D"
          }
          timestamp={"yesteryday nigga"}
          mediaType={"video"}
          mediaUrl={
            "https://fitcheckstorage.blob.core.windows.net/fitflare/13071904_1280_720_30fps.mp4?sv=2025-05-05&se=2025-05-12T09%3A11%3A46Z&sr=b&sp=r&sig=R%2B%2BiwBep%2Br%2FtWnvAKBVXO0vTlQDJJ7XEtbDfFsAdQAM%3D"
          }
          description={"yo thats a test"}
          likeCount={0}
          commentCount={0}
          shareCount={0}
        ></CardComponent>
      </div>
    </>
  );
}
