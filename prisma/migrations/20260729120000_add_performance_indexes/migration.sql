-- CreateIndex
CREATE INDEX "Product_categoryId_isVisible_idx" ON "Product"("categoryId", "isVisible");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Review_isApproved_idx" ON "Review"("isApproved");
