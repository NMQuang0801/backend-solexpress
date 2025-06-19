import { Dispatch } from 'react';
import { Button, Modal } from 'react-bootstrap';

const TermsModal = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Modal
      show={showModal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="modal-terms"
      onHide={() => setShowModal(false)}
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <div>
          <p>
            <strong className="terms-number">
              1. SOL EXPRESS không nhận vận chuyển các mặt hàng như sau.
            </strong>
          </p>
          <ul>
            <li>
              Các loại hàng hóa và tài liệu vi phạm quy định nhà nước như Ma túy, thuốc phiện, vũ
              khí, các loại văn hóa phẩm đồi trụy hoặc các tài liệu mang tính chất đả kích, bôi nhọ
              danh dự quyền lợi của cá nhân, tập thể, đất nước liên quan.
            </li>
            <li>
              Những hàng hóa cấm lưu thông, cấm kinh doanh, và các vật phẩm hàng hóa nước nhận cấm
              nhập khẩu.
            </li>
            <li>Tuyệt đối không nhận vận chuyển tiền bạc, kim loại đá quý, bạch kim,…</li>
          </ul>

          <p>
            <strong className="terms-number">
              2. Những mặt hàng thường xuyên được phép vận chuyển.
            </strong>
          </p>
          <ul>
            <li>
              Hàng quần áo, dụng cụ, máy móc, linh kiện, nội thất, thủ công mỹ nghệ… sản xuất tại
              Việt Nam. Những nguồn gốc khác phải có chứng từ hợp lệ kèm theo.
            </li>
            <li>
              Riêng hàng hóa, bưu phẩm gửi có tính chất nhạy cảm đối với nước đến như thực phẩm,
              chất lỏng, liên quan đến an toàn vệ sinh thì khách hàng phải khai báo rõ ràng để nhân
              viên Tien Viet tư vấn.
            </li>
            <li>
              Chất bột, chất lỏng phải được đóng gói an toàn, đảm bảo không gây hư hỏng ảnh hưởng
              đến bưu phẩm khác.
            </li>
            <li>
              Thuốc tây, thuốc nam, mỹ phẩm thuộc hàng nhạy cảm cần chứng từ hoặc khai báo rõ.
            </li>
          </ul>

          <p>
            <strong className="terms-number">3. Trách nhiệm của người gửi.</strong>
          </p>
          <ul>
            <li>
              Khai báo chính xác nội dung hàng hóa, cung cấp chứng từ và đảm bảo người nhận đủ điều
              kiện nhập khẩu.
            </li>
            <li>Đóng gói đảm bảo an toàn cho hàng hóa.</li>
            <li>
              Thực hiện đúng pháp luật và chịu mọi chi phí phát sinh, cũng như chịu trách nhiệm
              trước pháp luật.
            </li>
          </ul>

          <p>
            <strong className="terms-number">
              4. Trách nhiệm của SOL EXPRESS khi nhận hàng và giải quyết khiếu nại.
            </strong>
          </p>
          <ul>
            <li>Tien Viet được kiểm tra hàng, nếu phát hiện vi phạm sẽ từ chối phục vụ.</li>
            <li>Đảm bảo an toàn hàng hóa từ khi nhận đến khi giao.</li>
            <li>Bồi thường thiệt hại vật chất theo quy định nếu không có bảo hiểm:</li>
            <ul>
              <li>
                Tối đa 04 lần mức cước nội địa, tối thiểu 200.000đ, đặc biệt tối đa 1.000.000đ.
              </li>
              <li>Quốc tế: tối đa 200.000đ - 1.000.000đ tùy giấy tờ.</li>
              <li>Hàng quốc tế: theo chính sách của hãng như UPS, DHL, v.v.</li>
            </ul>
            <li>Không hoàn cước và không đền bù nếu:</li>
            <ul>
              <li>Bị cơ quan chức năng thu giữ hoặc nước ngoài từ chối.</li>
              <li>Bị hư hỏng do đặc tính tự nhiên.</li>
              <li>Thiệt hại gián tiếp, khiếu nại trễ hạn, hoặc trường hợp bất khả kháng.</li>
            </ul>
          </ul>

          <p>
            <strong className="terms-number">5. Một số lưu ý thêm.</strong>
          </p>
          <ul>
            <li>Khiếu nại trong vòng 30 ngày kể từ ngày gửi.</li>
            <li>
              Thu thêm phí nếu không giao được hàng do lỗi người gửi, người nhận hoặc điều kiện nước
              đến.
            </li>
            <li>
              Hàng sử dụng dịch vụ Chuyên Tuyến Air/Sea có chính sách đền bù riêng theo bảng giá.
            </li>
          </ul>

          <p>
            <strong className="terms-number">
              6. Lưu ý thêm về chính sách đền bù đối với các lô hàng sử dụng dịch vụ Chuyên Tuyến
            </strong>
          </p>
          <ul>
            <li>Không đền nếu hàng vượt $100 mà không mua bảo hiểm.</li>
            <li>Khuyến khích mua bảo hiểm từ 10–20% theo giá trị lô hàng (tối đa 1 tỷ đồng).</li>
            <li>
              Hải quan tịch thu: công ty đền hoặc không đền tùy loại hàng (phải có hình ảnh +
              video).
            </li>
            <li>Mất hàng: đền tối đa $100/lô hàng, không đền từng món bên trong.</li>
            <li>
              Hư hỏng do đi lâu: giảm 10–20% cước (trừ khi do hải quan, dịch bệnh, backlog...).
            </li>
            <li>Miễn khiếu nại nếu hàng dễ bị phụ thu (fake, thực phẩm, gạo...)</li>
            <li>
              Giao hàng update nhưng mất/không người nhận: đền tối đa 50% cước và $100 tiền hàng.
            </li>
            <li>
              Hàng fake, hàng cấm nhập, bị giữ bất kỳ lý do nào tại nước đến: không xử lý khiếu nại.
            </li>
            <li>
              Hàng bị hư, bể do đóng gói kém: đền tối đa 50% cước và hỗ trợ theo chính sách hãng.
            </li>
          </ul>

          <p>
            <strong>
              Lưu ý: Việc sử dụng dịch vụ đồng nghĩa với việc khách hàng đã đồng ý các điều khoản
              trên.
            </strong>
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setShowModal(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
export default TermsModal;
